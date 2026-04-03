import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

# 분리한 파일들에서 가져오기
import models
from database import engine, get_db

# DB 테이블 생성
models.Base.metadata.create_all(bind=engine)

def seed_activities(db: Session):
    if db.query(models.Activity).count() == 0:
        activities = [
            models.Activity(name="텀블러 사용하기",   type="텀블러",    desc="카페에서 텀블러를 사용해요"),
            models.Activity(name="쓰레기 줍기",      type="쓰레기 줍기", desc="주변 쓰레기를 주워요"),
            models.Activity(name="분리수거 실천하기", type="분리수거",   desc="올바르게 분리수거 해요"),
            models.Activity(name="플로깅 챌린지",    type="플로깅",    desc="달리며 쓰레기를 주워요"),
            models.Activity(name="해안 정화 활동",   type="해안 정화",  desc="해안가를 깨끗이 해요"),
        ]
        db.add_all(activities)
        db.commit()

@asynccontextmanager
async def lifespan(_app: FastAPI):
    db = next(get_db())
    seed_activities(db)
    yield

app = FastAPI(title="Semothon 9 API", lifespan=lifespan)

# --- Pydantic 스키마 (데이터 입출력 형식) ---
class UserUpdate(BaseModel):
    name: Optional[str] = None
    profile_image: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    profile_image: str
    points: int
    class Config: from_attributes = True

class RecordResponse(BaseModel):
    id: int
    content: str
    class Config: from_attributes = True

class ActivityResponse(BaseModel):
    id:   int
    name: str
    type: str
    desc: str
    class Config: from_attributes = True

class MemberResponse(BaseModel):
    id:      int
    user_id: int
    name:    str
    status:  str
    class Config: from_attributes = True

class RoomResponse(BaseModel):
    room_id:     int
    activity_id: int
    members:     List[MemberResponse]
    class Config: from_attributes = True

# --- 가짜 인증: 항상 첫 번째 유저를 '나'로 간주 ---
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(models.User).first()
    if not user:
        user = models.User(name="테스트 유저", points=100)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# --- API 엔드포인트 구현 ---

@app.get("/", tags=["Root"])
def root():
    return {"message": "서버가 정상 작동 중입니다. /docs로 이동하세요."}

# [GET] 내 프로필 조회
@app.get("/users/me", response_model=UserResponse, tags=["Users"])
def read_user_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# [PUT] 프로필 수정
@app.put("/users/me", response_model=UserResponse, tags=["Users"])
def update_user_me(obj_in: UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if obj_in.name: current_user.name = obj_in.name
    if obj_in.profile_image: current_user.profile_image = obj_in.profile_image
    db.commit()
    db.refresh(current_user)
    return current_user

# [DELETE] 회원 탈퇴
@app.delete("/users/me", tags=["Users"])
def delete_user_me(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
    return {"detail": "회원 탈퇴 완료"}

# [GET] 내 활동 기록 조회
@app.get("/users/me/records", response_model=List[RecordResponse], tags=["Records"])
def read_my_records(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Record).filter(models.Record.user_id == current_user.id).all()

# [DELETE] 기록 삭제
@app.delete("/users/me/records/{record_id}", tags=["Records"])
def delete_record(record_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    record = db.query(models.Record).filter(models.Record.id == record_id, models.Record.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없습니다.")
    db.delete(record)
    db.commit()
    return {"detail": "기록 삭제 완료"}

# [GET] 내 포인트 조회
@app.get("/users/me/points", tags=["Points"])
def read_my_points(current_user: models.User = Depends(get_current_user)):
    return {"points": current_user.points}

# [POST] 포인트 수령
@app.post("/users/me/points", tags=["Points"])
def add_points(amount: int = 10, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    current_user.points += amount
    db.commit()
    db.refresh(current_user)
    return {"message": f"{amount} 포인트 획득!", "total_points": current_user.points}

# [GET] 활동 목록 조회 — 프론트 MOCK_CHALLENGES 대체
@app.get("/activities", response_model=List[ActivityResponse], tags=["Activities"])
def get_activities(db: Session = Depends(get_db)):
    return db.query(models.Activity).all()


# [POST] 매칭 참여 — 대기열 진입, 상대 있으면 즉시 방 생성
@app.post("/matching/join/{activity_id}", tags=["Matching"])
def join_matching(activity_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    already = db.query(models.MatchQueue).filter_by(user_id=current_user.id, activity_id=activity_id).first()
    if already:
        return {"matched": False, "message": "이미 대기 중입니다"}

    waiting = db.query(models.MatchQueue).filter(
        models.MatchQueue.activity_id == activity_id,
        models.MatchQueue.user_id != current_user.id
    ).first()

    if waiting:
        room = models.Room(activity_id=activity_id)
        db.add(room)
        db.flush()
        db.add(models.RoomMember(room_id=room.id, user_id=waiting.user_id))
        db.add(models.RoomMember(room_id=room.id, user_id=current_user.id))
        db.delete(waiting)
        db.commit()
        return {"matched": True, "room_id": room.id}
    else:
        db.add(models.MatchQueue(user_id=current_user.id, activity_id=activity_id))
        db.commit()
        return {"matched": False}


# [GET] 매칭 상태 확인 — 프론트에서 1초마다 polling
@app.get("/matching/status", tags=["Matching"])
def get_matching_status(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    member = db.query(models.RoomMember).filter_by(user_id=current_user.id).order_by(models.RoomMember.id.desc()).first()
    if member:
        return {"matched": True, "room_id": member.room_id}
    return {"matched": False}


# [DELETE] 매칭 취소 — 대기열에서 제거
@app.delete("/matching/cancel", tags=["Matching"])
def cancel_matching(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db.query(models.MatchQueue).filter_by(user_id=current_user.id).delete()
    db.commit()
    return {"detail": "매칭 취소 완료"}


# [GET] 방 정보 조회 — 팀원 목록 포함
@app.get("/rooms/{room_id}", tags=["Rooms"])
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(models.Room).filter_by(id=room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    members = [
        {"id": m.id, "user_id": m.user_id, "name": m.user.name, "status": m.status}
        for m in room.members
    ]
    return {"room_id": room.id, "activity_id": room.activity_id, "members": members}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)