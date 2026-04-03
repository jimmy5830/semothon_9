import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';

/* ─── 임시 데이터 ─── */
const MOCK_RECORDS = [
  { id: 1, activity: '쓰레기 줍기', location: '한강공원',  date: '2025-03-28', point: 50,  status: 'approved', emoji: '🗑️' },
  { id: 2, activity: '분리수거',    location: '마포구 자택', date: '2025-03-27', point: 30,  status: 'approved', emoji: '♻️' },
  { id: 3, activity: '플로깅',      location: '북한산',      date: '2025-03-25', point: 80,  status: 'pending',  emoji: '🏃' },
  { id: 4, activity: '해안 정화',   location: '인천 을왕리', date: '2025-03-22', point: 120, status: 'approved', emoji: '🌊' },
  { id: 5, activity: '쓰레기 줍기', location: '홍대입구역',  date: '2025-03-20', point: 50,  status: 'rejected', emoji: '🗑️' },
];

const STATUS_MAP = {
  approved: { label: '인증 완료', color: '#03C75A', bg: '#E8F5E9' },
  pending:  { label: '검토 중',   color: '#E65100', bg: '#FFF3E0' },
  rejected: { label: '반려',      color: '#B71C1C', bg: '#FFEBEE' },
};

/* ─── 스타일 ─── */
const Page = styled.div`
  padding: 0 0 16px;
  min-height: 100%;
`;

const TopBar = styled.div`
  padding: 56px 20px 0;
  h1 { font-size: 22px; font-weight: 800; }
  p  { font-size: 14px; color: var(--color-text-secondary); margin-top: 4px; }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 20px 20px 0;
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

const SectionHeader = styled.div`
  margin-bottom: 14px;
  h3 { font-size: 17px; font-weight: 800; }
`;

const RecordCard = styled.div`
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

const RecordInfo = styled.div`
  flex: 1;
  min-width: 0;

  .act  { font-size: 15px; font-weight: 800; }
  .meta { font-size: 12px; color: var(--color-text-secondary); margin-top: 3px; }
`;

const RecordRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`;

const StatusBadge = styled.span`
  background: ${p => STATUS_MAP[p.status].bg};
  color: ${p => STATUS_MAP[p.status].color};
  border-radius: 40px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 800;
`;

const PointLabel = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: var(--color-primary);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  p    { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  span { font-size: 14px; color: var(--color-text-secondary); }
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

export default function Records() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 2️⃣ 페이지가 마운트될 때 localStorage에서 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('records');
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  // 3️⃣ localStorage 변화를 감지해서 상태 업데이트
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('records');
      if (saved) setRecords(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const approved = records.filter(r => r.status === 'approved');
  const totalPoints = approved.reduce((s, r) => s + r.point, 0);

  return (
    <Page>
      <TopBar>
        <h1>나의 활동 기록</h1>
        <p>지금까지 쌓아온 친환경 발자국</p>
      </TopBar>

      <StatRow>
        <StatCard>
          <div className="val">{records.length}</div>
          <div className="label">총 활동 수</div>
        </StatCard>
        <StatCard>
          <div className="val">{totalPoints}</div>
          <div className="label">획득 포인트</div>
        </StatCard>
        <StatCard>
          <div className="val">{approved.length}</div>
          <div className="label">인증 완료</div>
        </StatCard>
      </StatRow>

      <Section>
        <SectionHeader>
          <h3>활동 내역</h3>
        </SectionHeader>

        {records.length === 0 ? (
          <EmptyState>
            <p>📭 아직 활동 기록이 없어요</p>
            <span>홈에서 첫 활동을 인증해보세요!</span>
          </EmptyState>
        ) : (
          records.map(record => (
            <RecordCard key={record.id} onClick={() => setSelectedRecord(record)} style={{ cursor: 'pointer' }}>
              <EmojiCircle>{record.emoji}</EmojiCircle>
              <RecordInfo>
                <div className="act">{record.activity}</div>
                <div className="meta">📍 {record.location}</div>
                <div className="meta">📅 {record.date}</div>
                {record.description && <div className="meta">📝 {record.description}</div>}
              </RecordInfo>
              <RecordRight>
                <StatusBadge status={record.status}>
                  {STATUS_MAP[record.status].label}
                </StatusBadge>
                <PointLabel>+{record.point}P</PointLabel>
              </RecordRight>
            </RecordCard>
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