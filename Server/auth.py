from fastapi import APIRouter, Depends, Form, HTTPException
import bcrypt
from sqlalchemy.orm import Session

import models
from database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


@router.post("/register")
def register(
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    name: str = Form(...),
    db: Session = Depends(get_db),
):
    if db.query(models.Auth).filter(models.Auth.email == email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")

    auth = models.Auth(email=email, phone=phone, password=hash_password(password))
    db.add(auth)
    db.flush()  # auth.id 확정

    user = models.User(id=auth.id, name=name, email=email)
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "회원가입 성공", "user_id": user.id}


@router.post("/login")
def login(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    auth = db.query(models.Auth).filter(models.Auth.email == email).first()
    if not auth or not verify_password(password, auth.password):
        raise HTTPException(status_code=400, detail="이메일 또는 비밀번호가 틀렸습니다.")

    return {"message": "로그인 성공", "user_id": auth.id, "name": auth.user.name}
