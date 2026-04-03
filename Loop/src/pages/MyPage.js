import React from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

/* ─── 임시 데이터 ─── */
const MOCK_USER = {
  name: '김에코',
  email: 'kimeco@example.com',
  level: '에코 챔피언',
  point: 1240,
  streak: 7,
  badge: '🏆',
  joinDate: '2025.01.15',
};

const BADGES = [
  { id: 1, emoji: '🌱', label: '첫 활동', earned: true  },
  { id: 2, emoji: '🔥', label: '7일 연속', earned: true  },
  { id: 3, emoji: '♻️', label: '분리수거 5회', earned: true  },
  { id: 4, emoji: '🌊', label: '해안 정화', earned: false },
  { id: 5, emoji: '🏃', label: '플로깅 3회', earned: false },
  { id: 6, emoji: '🌍', label: '30일 연속', earned: false },
];

const MENU_ITEMS = [
  { label: '알림 설정',   icon: '🔔', action: null },
  { label: '개인정보 수정', icon: '✏️', action: null },
  { label: '공지사항',    icon: '📢', action: null },
  { label: '문의하기',    icon: '💬', action: null },
  { label: '로그아웃',    icon: '🚪', action: null, danger: true },
];

/* ─── 스타일 ─── */
const Page = styled.div`
  padding: 0 0 16px;
  min-height: 100%;
`;

const ProfileSection = styled.div`
  padding: 56px 20px 0;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AvatarLarge = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-pale), var(--color-border));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  flex-shrink: 0;
  border: 3px solid var(--color-primary);
`;

const ProfileInfo = styled.div`
  flex: 1;

  .name  { font-size: 20px; font-weight: 800; }
  .level { font-size: 13px; color: var(--color-primary); font-weight: 700; margin-top: 3px; }
  .email { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 20px 20px 0;
`;

const StatCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  padding: 14px 10px;
  text-align: center;
  box-shadow: var(--shadow-sm);

  .val   { font-size: 22px; font-weight: 800; color: var(--color-primary); }
  .label { font-size: 11px; font-weight: 700; color: var(--color-text-secondary); margin-top: 4px; }
`;

const Section = styled.section`
  margin-top: 24px;
  padding: 0 20px;
`;

const SectionTitle = styled.h3`
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 14px;
`;

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const BadgeItem = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  padding: 14px 8px;
  text-align: center;
  opacity: ${p => p.earned ? 1 : 0.4};
  box-shadow: var(--shadow-sm);
  filter: ${p => p.earned ? 'none' : 'grayscale(1)'};

  .icon  { font-size: 28px; }
  .label { font-size: 11px; font-weight: 700; color: var(--color-text-secondary); margin-top: 6px; }
`;

const MenuList = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

const MenuItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-family: var(--font);
  text-align: left;
  transition: background 0.1s;

  &:last-child { border-bottom: none; }
  &:active { background: var(--color-primary-pale); }

  .icon  { font-size: 18px; width: 24px; text-align: center; }
  .label {
    flex: 1;
    font-size: 15px;
    font-weight: 700;
    color: ${p => p.danger ? '#B71C1C' : 'var(--color-text)'};
  }
  .arrow { font-size: 16px; color: var(--color-text-secondary); }
`;

export default function MyPage() {
  return (
    <Page>
      {/* 프로필 */}
      <ProfileSection>
        <AvatarLarge>{MOCK_USER.badge}</AvatarLarge>
        <ProfileInfo>
          <div className="name">{MOCK_USER.name}</div>
          <div className="level">{MOCK_USER.level}</div>
          <div className="email">{MOCK_USER.email}</div>
        </ProfileInfo>
      </ProfileSection>

      {/* 통계 */}
      <StatRow>
        <StatCard>
          <div className="val">{MOCK_USER.point.toLocaleString()}</div>
          <div className="label">포인트</div>
        </StatCard>
        <StatCard>
          <div className="val">{MOCK_USER.streak}</div>
          <div className="label">연속 활동</div>
        </StatCard>
        <StatCard>
          <div className="val">{MOCK_USER.joinDate}</div>
          <div className="label">가입일</div>
        </StatCard>
      </StatRow>

      {/* 배지 */}
      <Section>
        <SectionTitle>획득 배지</SectionTitle>
        <BadgeGrid>
          {BADGES.map(b => (
            <BadgeItem key={b.id} earned={b.earned}>
              <div className="icon">{b.emoji}</div>
              <div className="label">{b.label}</div>
            </BadgeItem>
          ))}
        </BadgeGrid>
      </Section>

      {/* 메뉴 */}
      <Section>
        <SectionTitle>설정</SectionTitle>
        <MenuList>
          {MENU_ITEMS.map(item => (
            <MenuItem key={item.label} danger={item.danger} onClick={() => alert(`${item.label} 기능은 추후 구현 예정이에요!`)}>
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
              <span className="arrow">›</span>
            </MenuItem>
          ))}
        </MenuList>
      </Section>
    </Page>
  );
}
