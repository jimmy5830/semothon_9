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
    room_id:      int
    activity_id:  int
    capacity:     int
    can_certify:  bool
    members:      List[MemberResponse]
    class Config: from_attributes = True

class ProofCreate(BaseModel):
    image_url:   str
    description: str

# --- 가짜 인증: ?user_id=N 으로 유저 전환 가능 (테스트용) ---
def get_current_user(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        user = models.User(id=user_id, name=f"테스트 유저 {user_id}", points=100)
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


# [POST] 매칭 참여 — 빈 방 있으면 입장, 없으면 방 생성
@app.post("/matching/join/{activity_id}", tags=["Matching"])
def join_matching(activity_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 이미 해당 활동의 방에 들어가 있는지 확인
    existing = (
        db.query(models.RoomMember)
        .join(models.Room, models.RoomMember.room_id == models.Room.id)
        .filter(models.RoomMember.user_id == current_user.id, models.Room.activity_id == activity_id)
        .first()
    )
    if existing:
        can_certify = len(existing.room.members) >= 2
        return {"room_id": existing.room_id, "can_certify": can_certify, "message": "이미 방에 참여 중입니다"}

    # 정원이 차지 않은 방 중 가장 오래된 방(id 오름차순)
    available_room = (
        db.query(models.Room)
        .filter(models.Room.activity_id == activity_id)
        .all()
    )
    available_room = next(
        (r for r in sorted(available_room, key=lambda r: r.id)
         if r.status == "open" and len(r.members) < r.capacity),
        None
    )

    if available_room:
        db.add(models.RoomMember(room_id=available_room.id, user_id=current_user.id))
        db.commit()
        db.refresh(available_room)
        can_certify = len(available_room.members) >= 2
        return {"room_id": available_room.id, "can_certify": can_certify}
    else:
        room = models.Room(activity_id=activity_id, capacity=4)
        db.add(room)
        db.flush()
        db.add(models.RoomMember(room_id=room.id, user_id=current_user.id))
        db.commit()
        return {"room_id": room.id, "can_certify": False}


# [GET] 매칭 상태 확인 — 프론트에서 1초마다 polling
@app.get("/matching/status", tags=["Matching"])
def get_matching_status(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    member = db.query(models.RoomMember).filter_by(user_id=current_user.id).order_by(models.RoomMember.id.desc()).first()
    if member:
        can_certify = len(member.room.members) >= 2
        return {"room_id": member.room_id, "can_certify": can_certify}
    return {"room_id": None, "can_certify": False}


# [DELETE] 매칭 취소 — 방에서 퇴장 (방이 비면 방도 삭제)
@app.delete("/matching/cancel", tags=["Matching"])
def cancel_matching(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    member = db.query(models.RoomMember).filter_by(user_id=current_user.id).order_by(models.RoomMember.id.desc()).first()
    if not member:
        return {"detail": "참여 중인 방이 없습니다"}
    room = member.room
    db.delete(member)
    db.flush()
    db.refresh(room)
    if len(room.members) == 0:
        db.delete(room)
    db.commit()
    return {"detail": "방에서 퇴장했습니다"}


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
    return {
        "room_id": room.id,
        "activity_id": room.activity_id,
        "capacity": room.capacity,
        "can_certify": len(members) >= 2,
        "members": members,
    }


# [POST] 인증 요청 올리기
@app.post("/rooms/{room_id}/proof", tags=["Proof"])
def submit_proof(room_id: int, obj_in: ProofCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    room = db.query(models.Room).filter_by(id=room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다.")
    if room.status == "closed":
        raise HTTPException(status_code=400, detail="이미 종료된 방입니다.")
    existing = db.query(models.Proof).filter_by(room_id=room_id, user_id=current_user.id).first()
    if existing:
        if existing.status == "rejected":
            existing.image_url = obj_in.image_url
            existing.description = obj_in.description
            existing.status = "pending"
            db.commit()
            return {"message": "인증을 재제출했습니다. 상대방의 승인을 기다려주세요."}
        return {"message": "이미 인증을 제출했습니다."}
    db.add(models.Proof(
        room_id=room_id,
        user_id=current_user.id,
        image_url=obj_in.image_url,
        description=obj_in.description,
    ))
    db.commit()
    return {"message": "인증 요청 완료! 상대방의 승인을 기다려주세요."}


# [GET] 방 내 모든 인증 목록 조회
@app.get("/rooms/{room_id}/proofs", tags=["Proof"])
def get_room_proofs(room_id: int, db: Session = Depends(get_db)):
    proofs = db.query(models.Proof).filter_by(room_id=room_id).all()
    return [
        {"user_id": p.user_id, "image_url": p.image_url, "description": p.description, "status": p.status}
        for p in proofs
    ]


# [POST] 특정 멤버의 인증 반려
@app.post("/rooms/{room_id}/reject", tags=["Proof"])
def reject_partner_proof(room_id: int, target_user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="자신의 인증은 반려할 수 없습니다.")
    proof = db.query(models.Proof).filter_by(room_id=room_id, user_id=target_user_id).first()
    if not proof:
        raise HTTPException(status_code=404, detail="반려할 인증 내역이 없습니다.")
    if proof.status != "pending":
        raise HTTPException(status_code=400, detail=f"현재 상태({proof.status})에서는 반려할 수 없습니다.")

    proof.status = "rejected"
    db.commit()
    return {"message": "인증을 반려했습니다. 상대방이 재제출할 수 있습니다."}


# [POST] 특정 멤버의 인증 승인 (포인트 지급)
@app.post("/rooms/{room_id}/approve", tags=["Proof"])
def approve_partner_proof(room_id: int, target_user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="자신의 인증은 승인할 수 없습니다.")
    proof = db.query(models.Proof).filter_by(room_id=room_id, user_id=target_user_id).first()
    if not proof:
        raise HTTPException(status_code=404, detail="승인할 인증 내역이 없습니다.")
    if proof.status == "approved":
        return {"message": "이미 승인된 인증입니다."}

    proof.status = "approved"
    author = db.query(models.User).filter_by(id=proof.user_id).first()
    author.points += 100

    # 모든 멤버가 인증을 제출했고 전부 승인됐으면 방 종료
    proof_room = db.query(models.Room).filter_by(id=room_id).first()
    member_ids = {m.user_id for m in proof_room.members}
    approved_ids = {
        p.user_id for p in db.query(models.Proof).filter_by(room_id=room_id).all()
        if p.status == "approved"
    }
    if member_ids == approved_ids:
        proof_room.status = "closed"

    db.commit()
    room_closed = proof_room.status == "closed"
    msg = f"{author.name}님의 인증을 승인했습니다! 보상이 지급되었습니다."
    if room_closed:
        msg += " 모든 인원이 인증을 완료하여 방이 종료되었습니다."
    return {"message": msg, "room_closed": room_closed}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)