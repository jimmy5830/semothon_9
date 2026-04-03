import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

/* ─── 임시 데이터 (추후 API 연동) ─── */
const MOCK_USER = { name: '김에코', point: 1240, streak: 7 };
const MOCK_FEED = [
  { id: 1, user: '이지구', activity: '쓰레기 줍기', location: '한강공원', time: '10분 전', emoji: '🗑️', likes: 12 },
  { id: 2, user: '박초록', activity: '분리수거',   location: '마포구 홍대',  time: '32분 전', emoji: '♻️', likes: 8  },
  { id: 3, user: '최자연', activity: '쓰레기 줍기', location: '북한산',      time: '1시간 전', emoji: '🌿', likes: 21 },
];

/* ─── 스타일 ─── */
const Page = styled.div`
  padding: 0 0 16px;
  min-height: 100%;
`;

const TopBar = styled.div`
  padding: 56px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Greeting = styled.div`
  h1 { font-size: 22px; font-weight: 800; line-height: 1.3; }
  p  { font-size: 14px; color: var(--color-text-secondary); margin-top: 2px; }
`;

const PointBadge = styled.div`
  background: var(--color-primary-pale);
  border: 1.5px solid var(--color-border);
  border-radius: 40px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 800;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BannerCard = styled.div`
  margin: 20px 20px 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, #03C75A 100%);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  color: white;
  position: relative;
  overflow: hidden;

  &::after {
    content: '🌍';
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 64px;
    opacity: 0.25;
  }
`;

const BannerTitle = styled.p`
  font-size: 13px;
  font-weight: 700;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const BannerStat = styled.h2`
  font-size: 32px;
  font-weight: 800;
  margin: 4px 0 8px;
  line-height: 1;
`;

const BannerSub = styled.p`
  font-size: 13px;
  opacity: 0.85;
`;

const StreakRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 12px;
`;

const StreakDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.filled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)'};
`;

const Section = styled.section`
  margin-top: 28px;
  padding: 0 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;

  h3 { font-size: 17px; font-weight: 800; }
  button {
    background: none; border: none; cursor: pointer;
    font-size: 13px; font-weight: 700; color: var(--color-primary);
    font-family: var(--font);
  }
`;

const CertifyBtn = styled.button`
  width: 100%;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 18px;
  font-family: var(--font);
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(46,125,50,0.35);
  transition: transform 0.15s, box-shadow 0.15s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(46,125,50,0.25);
  }
`;

const FeedCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: var(--shadow-sm);
`;

const EmojiCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
`;

const FeedInfo = styled.div`
  flex: 1;
  min-width: 0;

  .name    { font-size: 14px; font-weight: 800; }
  .act     { font-size: 13px; color: var(--color-text-secondary); margin-top: 2px; }
  .meta    { font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; }
`;

const LikeBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font);
`;

const ApproveBtn = styled.button`
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 4px;
`;

const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const DetailModal = styled.div`
  width: 100%;
  max-width: 360px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 18px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.25);
  max-height: 90vh;
  overflow-y: auto;
`;

const DetailImage = styled.img`
  width: 100%;
  border-radius: 12px;
  height: auto;
  object-fit: cover;
  display: block;
  margin-bottom: 12px;
`;

const DetailClose = styled.button`
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-weight: 800;
  padding: 4px 8px;
  cursor: pointer;
  float: right;
`;

const DetailText = styled.p`
  font-size: 13px;
  color: var(--color-text);
  margin-top: 10px;
`;

const FeedPhoto = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
`;

export default function Home() {
  const navigate = useNavigate();
  const [likedIds, setLikedIds] = useState([]);
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(MOCK_USER);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 사용자 정보 localStorage에 저장 및 불러오기
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(MOCK_USER));
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('records');
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('records');
      if (saved) setRecords(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleLike = (id) =>
    setLikedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const approveRecord = (recordId) => {
    const updated = records.map(r => 
      r.id === recordId ? {...r, status: 'approved', point: 50} : r
    );
    setRecords(updated);
    localStorage.setItem('records', JSON.stringify(updated));
  };

  // 승인된 기록만 포인트 계산
  const approvedRecords = records.filter(r => r.status === 'approved');
  const totalPoints = approvedRecords.reduce((sum, r) => sum + r.point, 0);

  return (
    <Page>
      {/* 상단 인사 */}
      <TopBar>
        <Greeting>
          <h1>안녕하세요, {user.name}님 👋</h1>
          <p>오늘도 지구를 지켜봐요!</p>
        </Greeting>
        <PointBadge>🌱 {totalPoints.toLocaleString()}P</PointBadge>
      </TopBar>

      {/* 활동 배너 */}
      <BannerCard style={{ margin: '20px 20px 0' }}>
        <BannerTitle>이번 주 활동 스트릭</BannerTitle>
        <BannerStat>{MOCK_USER.streak}일 🔥</BannerStat>
        <BannerSub>연속으로 환경 보호에 참여 중이에요!</BannerSub>
        <StreakRow>
          {Array.from({ length: 7 }, (_, i) => (
            <StreakDot key={i} filled={i < MOCK_USER.streak} />
          ))}
        </StreakRow>
      </BannerCard>

      {/* 인증하기 버튼 */}
      <Section>
        <CertifyBtn onClick={() => alert('카메라 기능은 백엔드 연동 후 구현 예정!')}>
          📸 지금 바로 인증하기
        </CertifyBtn>
      </Section>

      {/* 실시간 피드 */}
      <Section>
        <SectionHeader>
          <h3>실시간 활동 피드</h3>
          <button onClick={() => navigate('/records')}>전체보기</button>
        </SectionHeader>

        {records.length === 0 ? (
  <p>아직 활동이 없어요 😢</p>
) : (
  records.map(item => (
    <FeedCard key={item.id} onClick={() => setSelectedRecord(item)} style={{ cursor: 'pointer' }}>
      <EmojiCircle>{item.emoji}</EmojiCircle>
      <FeedInfo>
        <div className="name">{item.user || user.name}</div>
        <div className="act">{item.activity}</div>
        <div className="meta">
          📍 {item.location} • {item.status === 'pending' ? '검토 중 ⏳' : '인증 완료 ✅'}
        </div>
      </FeedInfo>
      {item.status === 'pending' ? (
        <ApproveBtn
          onClick={e => {
            e.stopPropagation();
            approveRecord(item.id);
          }}
        >
          승인
        </ApproveBtn>
      ) : (
        <LikeBtn
          onClick={e => {
            e.stopPropagation();
            toggleLike(item.id);
          }}
        >
          <span style={{ fontSize: 20 }}>
            {likedIds.includes(item.id) ? '💚' : '🤍'}
          </span>
        </LikeBtn>
      )}
    </FeedCard>
  ))
)}
      </Section>

      {selectedRecord && (
        <DetailOverlay onClick={() => setSelectedRecord(null)}>
          <DetailModal onClick={e => e.stopPropagation()}>
            <DetailClose onClick={() => setSelectedRecord(null)}>✕ 닫기</DetailClose>
            <div style={{ marginBottom: 8, color: 'var(--color-text-secondary)', fontSize: 12 }}>
              {selectedRecord.status === 'pending' ? '검토 중' : '인증 완료'} • {selectedRecord.date || ''}
            </div>
            {selectedRecord.photo ? (
              <DetailImage src={selectedRecord.photo} alt="활동 인증 사진" />
            ) : (
              <div style={{
                width: '100%', height: 180, borderRadius: 12, background: '#F0F0EC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8F8F87'
              }}>
                사진 없음
              </div>
            )}
            <DetailText>활동: {selectedRecord.activity}</DetailText>
            <DetailText>위치: {selectedRecord.location}</DetailText>
            {selectedRecord.description && (
              <DetailText>설명: {selectedRecord.description}</DetailText>
            )}
          </DetailModal>
        </DetailOverlay>
      )}
    </Page>
  );
}
