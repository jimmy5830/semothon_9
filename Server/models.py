from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="새 사용자")
    email = Column(String, unique=True, index=True, nullable=True)
    profile_image = Column(String, default="default.png")
    
    # 포인트 및 게임 데이터
    level = Column(Integer, default=1)
    points = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    badge = Column(String, nullable=True)
    
    # 가입일 (서버 시간 자동 기록)
    join_date = Column(DateTime(timezone=True), server_default=func.now())

class Record(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Activity(Base):
    __tablename__ = "activities"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    desc = Column(String, nullable=False, default="")


class Room(Base):
    __tablename__ = "rooms"

    id          = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    capacity    = Column(Integer, nullable=False, default=4)
    status      = Column(String, nullable=False, default="open")  # open / closed
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    activity = relationship("Activity")
    members  = relationship("RoomMember", back_populates="room")


class RoomMember(Base):
    __tablename__ = "room_members"

    id      = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status  = Column(String, nullable=False, default="waiting")  # waiting / started / completed

    room = relationship("Room", back_populates="members")
    user = relationship("User")


class Proof(Base):
    __tablename__ = "proofs"

    id          = Column(Integer, primary_key=True, index=True)
    room_id     = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_url   = Column(String)
    description = Column(String)
    status      = Column(String, default="pending")  # pending / approved
