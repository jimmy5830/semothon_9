import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

# 분리한 파일들에서 가져오기
import models
from database import engine, get_db

# DB 테이블 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Semothon 9 API")

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

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)