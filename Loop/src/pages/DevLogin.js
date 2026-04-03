import React, { useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { setUserId } from '../api';

/* ─── Mock 유저 목록 ─── */
const MOCK_USERS = [
  { id: 1, name: '이환경', emoji: '🌿', desc: '환경 보호 1년차' },
  { id: 2, name: '김초록', emoji: '♻️', desc: '분리수거 마스터'  },
  { id: 3, name: '박루프', emoji: '🌊', desc: '해안 정화 활동가' },
  { id: 4, name: '최자연', emoji: '🌱', desc: '플로깅 챌린저'    },
];

/* ─── 애니메이션 ─── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── 스타일 ─── */
const Screen = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  padding: 0 20px 40px;
`;

const Top = styled.div`
  padding: 64px 0 32px;
  text-align: center;
  animation: ${fadeUp} 0.4s ease both;
`;

const Logo = styled.div`
  font-size: 42px;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -1px;
`;

const Subtitle = styled.p`
  margin-top: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
`;

const DevBadge = styled.div`
  display: inline-block;
  margin-top: 16px;
  background: #FFF3E0;
  color: #E65100;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 40px;
  letter-spacing: 0.5px;
`;

const Label = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  margin-top: 8px;
  animation: ${fadeUp} 0.4s ease 0.1s both;
`;

const UserCard = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-surface);
  border: 2px solid ${p => p.selected ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 10px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s;
  box-shadow: ${p => p.selected ? '0 0 0 3px rgba(3,199,90,0.15)' : 'var(--shadow-sm)'};
  transform: ${p => p.selected ? 'scale(1.02)' : 'scale(1)'};
  animation: ${fadeUp} 0.4s ease ${p => `${0.15 + p.index * 0.07}s`} both;

  &:active { transform: scale(0.98); }
`;

const Avatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--color-primary-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
  border: 2px solid ${p => p.selected ? 'var(--color-primary)' : 'transparent'};
  transition: border-color 0.15s;
`;

const UserInfo = styled.div`
  flex: 1;
  .name { font-size: 16px; font-weight: 800; color: var(--color-text); }
  .id   { font-size: 11px; font-weight: 600; color: var(--color-text-secondary); margin-top: 1px; }
  .desc { font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; }
`;

const CheckIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${p => p.selected ? 'var(--color-primary)' : 'var(--color-border)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
  color: white;
  font-size: 13px;
`;

const EnterBtn = styled.button`
  width: 100%;
  margin-top: 24px;
  padding: 17px;
  background: ${p => p.disabled ? 'var(--color-border)' : 'var(--color-primary)'};
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font);
  font-size: 16px;
  font-weight: 800;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  box-shadow: ${p => p.disabled ? 'none' : '0 4px 16px rgba(3,199,90,0.35)'};
  transition: opacity 0.15s, transform 0.12s;
  animation: ${fadeUp} 0.4s ease 0.45s both;

  &:active { transform: ${p => p.disabled ? 'none' : 'scale(0.98)'}; }
`;

const Divider = styled.div`
  margin: 20px 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: ${fadeUp} 0.4s ease 0.1s both;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border);
  }

  span { font-size: 11px; color: var(--color-text-secondary); font-weight: 600; white-space: nowrap; }
`;

/* ─── 컴포넌트 ─── */
export default function DevLogin() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  const handleEnter = () => {
    if (!selectedId) return;
    setUserId(selectedId);                // localStorage에 user_id 저장
    navigate('/matching');                // 바로 매칭 페이지로
  };

  return (
    <Screen>
      <Top>
        <Logo>🌿 Loop</Logo>
        <Subtitle>환경 보호 활동 인증 플랫폼</Subtitle>
        <DevBadge>⚙️ DEV MODE — 로그인 임시 우회</DevBadge>
      </Top>

      <Label>테스트할 유저를 선택하세요</Label>

      {MOCK_USERS.map((user, i) => (
        <UserCard
          key={user.id}
          index={i}
          selected={selectedId === user.id}
          onClick={() => setSelectedId(user.id)}
        >
          <Avatar selected={selectedId === user.id}>{user.emoji}</Avatar>
          <UserInfo>
            <div className="name">{user.name}</div>
            <div className="id">user_id: {user.id}</div>
            <div className="desc">{user.desc}</div>
          </UserInfo>
          <CheckIcon selected={selectedId === user.id}>
            {selectedId === user.id ? '✓' : ''}
          </CheckIcon>
        </UserCard>
      ))}

      <Divider><span>선택 후 바로 매칭 화면으로 이동합니다</span></Divider>

      <EnterBtn disabled={!selectedId} onClick={handleEnter}>
        {selectedId
          ? `${MOCK_USERS.find(u => u.id === selectedId)?.name}(으)로 입장하기 →`
          : '유저를 선택하세요'}
      </EnterBtn>
    </Screen>
  );
}
