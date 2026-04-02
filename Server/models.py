from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
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
