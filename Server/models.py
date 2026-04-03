from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    level = Column(String, nullable=False, default="초보")
    point = Column(Integer, nullable=False, default=0)
    streak = Column(Integer, nullable=False, default=0)
    badge = Column(String, nullable=False, default="🌱")
    join_date = Column(String, nullable=False, default="")

    badges = relationship("Badge", back_populates="user")


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    emoji = Column(String, nullable=False)
    label = Column(String, nullable=False)
    earned = Column(Boolean, nullable=False, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="badges")


class Activity(Base):
    __tablename__ = "activities"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    desc = Column(String, nullable=False, default="")


class MatchQueue(Base):
    __tablename__ = "match_queue"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user     = relationship("User")
    activity = relationship("Activity")


class Room(Base):
    __tablename__ = "rooms"

    id          = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
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
    