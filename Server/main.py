import logging
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

import models
import auth as auth_router
from database import engine, get_db

# ──────────────────────────────────────────────
# 컬러 디버그 로거 설정
# ──────────────────────────────────────────────
class ColorFormatter(logging.Formatter):
    R  = '\033[0m'
    B  = '\033[1m'
    C  = {
        'DEBUG':    '\033[96m',   # 밝은 청록
        'INFO':     '\033[92m',   # 밝은 초록
        'WARNING':  '\033[93m',   # 노랑
        'ERROR':    '\033[91m',   # 빨강
        'CRITICAL': '\033[95m',   # 마젠타
    }
    ICONS = {
        'DEBUG':    '🔍',
        'INFO':     '✅',
        'WARNING':  '⚠️ ',
        'ERROR':    '❌',
        'CRITICAL': '🔥',
    }
    def format(self, record):
        c    = self.C.get(record.levelname, self.R)
        icon = self.ICONS.get(record.levelname, '')
        time = self.formatTime(record, '%H:%M:%S')
        return f"{c}{self.B}{icon} [{time}] {record.getMessage()}{self.R}"

_handler = logging.StreamHandler()
_handler.setFormatter(ColorFormatter())
logger = logging.getLogger('loop')
logger.setLevel(logging.DEBUG)
logger.addHandler(_handler)
logger.propagate = False  # uvicorn 기본 로거와 중복 방지

# ──────────────────────────────────────────────
# DB 초기화 & Seed
# ──────────────────────────────────────────────
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
        logger.info("📋 활동 목록 시드 데이터 삽입 완료 (5개)")

@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("🚀 Loop 서버 시작 — http://127.0.0.1:8000  /docs 에서 API 확인 가능")
    db = next(get_db())
    seed_activities(db)
    yield
    logger.info("🛑 Loop 서버 종료")

app = FastAPI(title="Semothon 9 API", lifespan=lifespan)

# ──────────────────────────────────────────────
# CORS — 프론트(localhost:3000) 허용
# ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)

# ──────────────────────────────────────────────
# Pydantic 스키마
# ──────────────────────────────────────────────
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

# ──────────────────────────────────────────────
# 현재 유저 의존성 (테스트용: ?user_id=N)
# ──────────────────────────────────────────────
def get_current_user(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        auth = db.query(models.Auth).filter(models.Auth.id == user_id).first()
        if not auth:
            auth = models.Auth(email=f"test{user_id}@test.com", phone="", password="test")
            db.add(auth)
            db.flush()
        user = models.User(id=auth.id, name=f"테스트 유저 {user_id}", points=100)
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.debug(f"테스트 유저 자동 생성 — user_id={user_id}, name={user.name}")
    return user

# ──────────────────────────────────────────────
# Root
# ──────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    return {"message": "서버가 정상 작동 중입니다. /docs로 이동하세요."}

# ──────────────────────────────────────────────
# Users
# ──────────────────────────────────────────────
@app.get("/users/me", response_model=UserResponse, tags=["Users"])
def read_user_me(current_user: models.User = Depends(get_current_user)):
    logger.info(f"[GET /users/me] 유저 조회 — id={current_user.id}, name={current_user.name}, points={current_user.points}")
    return current_user

@app.put("/users/me", response_model=UserResponse, tags=["Users"])
def update_user_me(obj_in: UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if obj_in.name:          current_user.name = obj_in.name
    if obj_in.profile_image: current_user.profile_image = obj_in.profile_image
    db.commit()
    db.refresh(current_user)
    logger.info(f"[PUT /users/me] 프로필 수정 — id={current_user.id}, name={current_user.name}, image={current_user.profile_image}")
    return current_user

@app.delete("/users/me", tags=["Users"])
def delete_user_me(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logger.warning(f"[DELETE /users/me] 회원 탈퇴 — id={current_user.id}, name={current_user.name}")
    db.delete(current_user)
    db.commit()
    return {"detail": "회원 탈퇴 완료"}

# ──────────────────────────────────────────────
# Records
# ──────────────────────────────────────────────
@app.get("/users/me/records", response_model=List[RecordResponse], tags=["Records"])
def read_my_records(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    records = db.query(models.Record).filter(models.Record.user_id == current_user.id).all()
    logger.info(f"[GET /users/me/records] 기록 조회 — user_id={current_user.id}, 총 {len(records)}개")
    return records

@app.delete("/users/me/records/{record_id}", tags=["Records"])
def delete_record(record_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    record = db.query(models.Record).filter(models.Record.id == record_id, models.Record.user_id == current_user.id).first()
    if not record:
        logger.warning(f"[DELETE /users/me/records/{record_id}] 기록 없음 — user_id={current_user.id}")
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없습니다.")
    db.delete(record)
    db.commit()
    logger.info(f"[DELETE /users/me/records/{record_id}] 기록 삭제 완료 — user_id={current_user.id}")
    return {"detail": "기록 삭제 완료"}

# ──────────────────────────────────────────────
# Points
# ──────────────────────────────────────────────
@app.get("/users/me/points", tags=["Points"])
def read_my_points(current_user: models.User = Depends(get_current_user)):
    logger.info(f"[GET /users/me/points] 포인트 조회 — user_id={current_user.id}, points={current_user.points}")
    return {"points": current_user.points}

@app.post("/users/me/points", tags=["Points"])
def add_points(amount: int = 10, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    current_user.points += amount
    db.commit()
    db.refresh(current_user)
    logger.info(f"[POST /users/me/points] 포인트 지급 — user_id={current_user.id}, +{amount}P → 합계 {current_user.points}P")
    return {"message": f"{amount} 포인트 획득!", "total_points": current_user.points}

# ──────────────────────────────────────────────
# Activities
# ──────────────────────────────────────────────
@app.get("/activities", response_model=List[ActivityResponse], tags=["Activities"])
def get_activities(db: Session = Depends(get_db)):
    activities = db.query(models.Activity).all()
    logger.info(f"[GET /activities] 활동 목록 반환 — 총 {len(activities)}개")
    return activities

# ──────────────────────────────────────────────
# Matching
# ──────────────────────────────────────────────
@app.post("/matching/join/{activity_id}", tags=["Matching"])
def join_matching(activity_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 이미 해당 활동의 방에 있는지 확인
    existing = (
        db.query(models.RoomMember)
        .join(models.Room, models.RoomMember.room_id == models.Room.id)
        .filter(models.RoomMember.user_id == current_user.id, models.Room.activity_id == activity_id)
        .first()
    )
    if existing:
        can_certify = len(existing.room.members) >= 2
        logger.debug(f"[POST /matching/join/{activity_id}] 이미 참여 중 — user_id={current_user.id}, room_id={existing.room_id}, can_certify={can_certify}")
        return {"room_id": existing.room_id, "can_certify": can_certify, "message": "이미 방에 참여 중입니다"}

    # 빈 방 탐색
    available_room = next(
        (r for r in sorted(
            db.query(models.Room).filter(models.Room.activity_id == activity_id).all(),
            key=lambda r: r.id
        ) if r.status == "open" and len(r.members) < r.capacity),
        None
    )

    if available_room:
        db.add(models.RoomMember(room_id=available_room.id, user_id=current_user.id))
        db.commit()
        db.refresh(available_room)
        can_certify = len(available_room.members) >= 2
        logger.info(f"[POST /matching/join/{activity_id}] 기존 방 입장 🚪 — user={current_user.name}(id={current_user.id}), room_id={available_room.id}, 현재 {len(available_room.members)}명, can_certify={can_certify}")
        return {"room_id": available_room.id, "can_certify": can_certify}
    else:
        room = models.Room(activity_id=activity_id, capacity=4)
        db.add(room)
        db.flush()
        db.add(models.RoomMember(room_id=room.id, user_id=current_user.id))
        db.commit()
        logger.info(f"[POST /matching/join/{activity_id}] 새 방 생성 🏠 — user={current_user.name}(id={current_user.id}), room_id={room.id}, 대기 중...")
        return {"room_id": room.id, "can_certify": False}

@app.get("/matching/status", tags=["Matching"])
def get_matching_status(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    member = db.query(models.RoomMember).filter_by(user_id=current_user.id).order_by(models.RoomMember.id.desc()).first()
    if member:
        can_certify = len(member.room.members) >= 2
        logger.debug(f"[GET /matching/status] 매칭 상태 — user_id={current_user.id}, room_id={member.room_id}, 현재 {len(member.room.members)}명, can_certify={can_certify}")
        return {"room_id": member.room_id, "can_certify": can_certify}
    logger.debug(f"[GET /matching/status] 참여 중인 방 없음 — user_id={current_user.id}")
    return {"room_id": None, "can_certify": False}

@app.delete("/matching/cancel", tags=["Matching"])
def cancel_matching(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    member = db.query(models.RoomMember).filter_by(user_id=current_user.id).order_by(models.RoomMember.id.desc()).first()
    if not member:
        logger.debug(f"[DELETE /matching/cancel] 참여 중인 방 없음 — user_id={current_user.id}")
        return {"detail": "참여 중인 방이 없습니다"}
    room = member.room
    db.delete(member)
    db.flush()
    db.refresh(room)
    if len(room.members) == 0:
        db.delete(room)
        logger.info(f"[DELETE /matching/cancel] 방 퇴장 + 빈 방 삭제 🗑️ — user={current_user.name}(id={current_user.id}), room_id={room.id}")
    else:
        logger.info(f"[DELETE /matching/cancel] 방 퇴장 — user={current_user.name}(id={current_user.id}), room_id={room.id}, 남은 인원: {len(room.members)}명")
    db.commit()
    return {"detail": "방에서 퇴장했습니다"}

# ──────────────────────────────────────────────
# Rooms
# ──────────────────────────────────────────────
@app.get("/rooms/{room_id}", tags=["Rooms"])
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(models.Room).filter_by(id=room_id).first()
    if not room:
        logger.warning(f"[GET /rooms/{room_id}] 방을 찾을 수 없음")
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")

    # 각 멤버의 proof 상태 포함
    proofs = {p.user_id: p.status for p in db.query(models.Proof).filter_by(room_id=room_id).all()}
    members = [
        {
            "id":       m.id,
            "user_id":  m.user_id,
            "name":     m.user.name,
            "status":   proofs.get(m.user_id, "waiting"),  # proof 상태를 멤버 status로 노출
        }
        for m in room.members
    ]
    logger.debug(f"[GET /rooms/{room_id}] 방 조회 — 멤버 {len(members)}명, statuses={[m['status'] for m in members]}")
    return {
        "room_id":      room.id,
        "activity_id":  room.activity_id,
        "capacity":     room.capacity,
        "can_certify":  len(members) >= 2,
        "members":      members,
    }

# ──────────────────────────────────────────────
# Proof
# ──────────────────────────────────────────────
@app.post("/rooms/{room_id}/proof", tags=["Proof"])
def submit_proof(room_id: int, obj_in: ProofCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    room = db.query(models.Room).filter_by(id=room_id).first()
    if not room:
        logger.warning(f"[POST /rooms/{room_id}/proof] 방을 찾을 수 없음 — user_id={current_user.id}")
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다.")
    if room.status == "closed":
        raise HTTPException(status_code=400, detail="이미 종료된 방입니다.")

    existing = db.query(models.Proof).filter_by(room_id=room_id, user_id=current_user.id).first()
    if existing:
        if existing.status == "rejected":
            existing.image_url   = obj_in.image_url
            existing.description = obj_in.description
            existing.status      = "pending"
            db.commit()
            logger.info(f"[POST /rooms/{room_id}/proof] 인증 재제출 🔄 — user={current_user.name}(id={current_user.id})")
            return {"message": "인증을 재제출했습니다. 상대방의 승인을 기다려주세요."}
        logger.debug(f"[POST /rooms/{room_id}/proof] 이미 제출됨 — user_id={current_user.id}, status={existing.status}")
        return {"message": "이미 인증을 제출했습니다."}

    db.add(models.Proof(room_id=room_id, user_id=current_user.id, image_url=obj_in.image_url, description=obj_in.description))
    db.commit()
    logger.info(f"[POST /rooms/{room_id}/proof] 인증 제출 📸 — user={current_user.name}(id={current_user.id}), desc='{obj_in.description[:30]}'")
    return {"message": "인증 요청 완료! 상대방의 승인을 기다려주세요."}

@app.get("/rooms/{room_id}/proofs", tags=["Proof"])
def get_room_proofs(room_id: int, db: Session = Depends(get_db)):
    proofs = db.query(models.Proof).filter_by(room_id=room_id).all()
    logger.debug(f"[GET /rooms/{room_id}/proofs] 인증 목록 — {len(proofs)}개")
    return [{"user_id": p.user_id, "image_url": p.image_url, "description": p.description, "status": p.status} for p in proofs]

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
    target = db.query(models.User).filter_by(id=target_user_id).first()
    logger.warning(f"[POST /rooms/{room_id}/reject] 인증 반려 ❌ — 반려자={current_user.name}, 대상={target.name if target else target_user_id}")
    return {"message": "인증을 반려했습니다. 상대방이 재제출할 수 있습니다."}

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
    logger.info(f"[POST /rooms/{room_id}/approve] 인증 승인 ✅ — 승인자={current_user.name}, 대상={author.name}(+100P → {author.points}P)")

    # 방 종료 조건 체크
    room     = db.query(models.Room).filter_by(id=room_id).first()
    activity = db.query(models.Activity).filter_by(id=room.activity_id).first()
    member_ids   = {m.user_id for m in room.members}
    all_proofs   = db.query(models.Proof).filter_by(room_id=room_id).all()
    approved_ids = {p.user_id for p in all_proofs if p.status == "approved"}

    if member_ids == approved_ids:
        # 모든 멤버 승인 완료 → Record 저장 + 방 해체
        for m_id in member_ids:
            db.add(models.Record(user_id=m_id, content=f"[{activity.name}] 협동 미션 완료! 보상 100포인트 획득"))
        db.query(models.Proof).filter_by(room_id=room_id).delete()
        db.query(models.RoomMember).filter_by(room_id=room_id).delete()
        db.delete(room)
        db.commit()
        logger.info(f"[POST /rooms/{room_id}/approve] 🎉 모든 인증 완료! 방 해체 — activity={activity.name}, 참여자={len(member_ids)}명")
        return {"message": "모든 인원이 인증을 완료했습니다! 기록 저장 후 방이 해체되었습니다.", "room_closed": True}

    db.commit()
    logger.info(f"[POST /rooms/{room_id}/approve] 일부 승인 완료 — 승인됨: {len(approved_ids)}/{len(member_ids)}명")
    return {"message": f"{author.name}님의 인증을 승인했습니다! (상대방의 승인을 기다리는 중)", "room_closed": False}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)