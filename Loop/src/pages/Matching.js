import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes as kf } from '@emotion/react';
import MatchingRoom from './MatchingRoom';
import { api, getUserId } from '../api';

/* ─── 타입별 아이콘 ─── */
const ICONS = {
    tumbler: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="7" y="4" width="14" height="20" rx="4"
                  fill="none" stroke="var(--color-primary)" strokeWidth="1.8"/>
            <path d="M10 4V8C10 9.1 10.9 10 12 10H16C17.1 10 18 9.1 18 8V4"
                  stroke="var(--color-primary)" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="14" cy="17" r="2.5" fill="var(--color-primary)" opacity="0.3"/>
        </svg>
    ),
    trash: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 8H22M10 8V6H18V8M9 8L10 22H18L19 8"
                  stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12V18M16 12V18"
                  stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),
    recycle: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 5L17 10H11L14 5Z" fill="var(--color-primary)"/>
            <path d="M14 23L11 18H17L14 23Z" fill="var(--color-primary)"/>
            <path d="M5 17L8 12L10.5 16.5" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M23 17L20 12L17.5 16.5" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M8 17H20" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
    ),
    plogging: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="17" cy="6" r="2.5" fill="var(--color-primary)"/>
            <path d="M14 10L11 20M14 10L18 14L22 12M14 10L16 15L13 22"
                  stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 18L9 14L11 16"
                  stroke="var(--color-primary-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    ocean: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 16C6 14 8 18 10 16C12 14 14 18 16 16C18 14 20 18 22 16"
                  stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 20C6 18 8 22 10 20C12 18 14 22 16 20C18 18 20 22 22 20"
                  stroke="var(--color-primary-light)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6"/>
            <path d="M14 12V6M14 6L11 9M14 6L17 9"
                  stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
};

/** 활동 type 문자열 → 아이콘 */
const getIcon = (type) => {
    const map = {
        '텀블러':    ICONS.tumbler,
        '쓰레기 줍기': ICONS.trash,
        '분리수거':  ICONS.recycle,
        '플로깅':    ICONS.plogging,
        '해안 정화': ICONS.ocean,
    };
    return map[type] || ICONS.recycle;
};

/** 활동 type 문자열 → 이모지 */
const getEmoji = (type) => {
    const map = {
        '텀블러':    '🥤',
        '쓰레기 줍기': '🗑️',
        '분리수거':  '♻️',
        '플로깅':    '🏃',
        '해안 정화': '🌊',
    };
    return map[type] || '✨';
};

const ACTIVITY_TYPES = ['전체', '텀블러', '쓰레기 줍기', '분리수거', '플로깅', '해안 정화'];

/* ─── 애니메이션 ─── */
const pulseRing = kf`
  0%   { transform: scale(0.85); opacity: 0.6; }
  50%  { transform: scale(1.05); opacity: 0.15; }
  100% { transform: scale(0.85); opacity: 0.6; }
`;
const pulseRing2 = kf`
  0%   { transform: scale(0.75); opacity: 0.4; }
  50%  { transform: scale(1.15); opacity: 0.08; }
  100% { transform: scale(0.75); opacity: 0.4; }
`;
const scaleIn = kf`
  0%   { transform: scale(0.7); opacity: 0; }
  60%  { transform: scale(1.08); }
  100% { transform: scale(1);   opacity: 1; }
`;
const fadeSlideUp = kf`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── 스타일 ─── */
const Page = styled.div`
  padding: 0 0 16px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
`;
const TopBar = styled.div`
  padding: 56px 20px 0;
  h1 { font-size: 22px; font-weight: 800; }
  p  { font-size: 14px; color: var(--color-text-secondary); margin-top: 4px; }
`;
const FilterScroll = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 20px 0;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;
const FilterChip = styled.button`
  flex-shrink: 0;
  background: ${p => p.active ? 'var(--color-primary)' : 'var(--color-surface)'};
  color: ${p => p.active ? 'white' : 'var(--color-text-secondary)'};
  border: 1.5px solid ${p => p.active ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: 40px;
  padding: 8px 16px;
  font-family: var(--font);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
`;
const Section = styled.div`
  padding: 16px 16px 0;
  flex: 1;
`;
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  h3 { font-size: 16px; font-weight: 800; }
  p  { font-size: 13px; color: var(--color-text-secondary); }
`;
const ActivityCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 10px;
  box-shadow: var(--shadow-sm);
  animation: ${fadeSlideUp} 0.3s ease both;
`;
const IconCircle = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--color-primary-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
const ActivityInfo = styled.div`
  flex: 1;
  min-width: 0;
  .name { font-size: 15px; font-weight: 800; }
  .desc { font-size: 12px; color: var(--color-text-secondary); margin-top: 3px; }
`;
const JoinBtn = styled.button`
  background: ${p => p.joined ? 'var(--color-primary-pale)' : 'var(--color-primary)'};
  color: ${p => p.joined ? 'var(--color-primary)' : 'white'};
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 18px;
  font-family: var(--font);
  font-size: 13px;
  font-weight: 800;
  cursor: ${p => p.joined ? 'default' : 'pointer'};
  flex-shrink: 0;
  transition: opacity 0.15s;
  &:active { opacity: 0.8; }
`;
const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  p    { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  span { font-size: 14px; color: var(--color-text-secondary); }
`;

/* ─── 매칭 대기 화면 스타일 ─── */
const MatchingArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;
const CircleWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 220px;
`;
const Ring = styled.div`
  position: absolute;
  border-radius: 50%;
  background: ${p => p.done ? 'rgba(46,125,50,0.12)' : 'rgba(46,125,50,0.18)'};
  animation: ${p => p.done ? 'none' : pulseRing} 1.8s ease-in-out infinite;
  animation-delay: ${p => p.delay || '0s'};
  width: ${p => p.size}px;
  height: ${p => p.size}px;
`;
const Ring2 = styled.div`
  position: absolute;
  border-radius: 50%;
  background: rgba(46,125,50,0.1);
  animation: ${p => p.done ? 'none' : pulseRing2} 1.8s ease-in-out infinite;
  animation-delay: 0.3s;
  width: ${p => p.size}px;
  height: ${p => p.size}px;
`;
const CoreCircle = styled.div`
  position: relative;
  z-index: 2;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: ${p => p.done
    ? 'linear-gradient(135deg, var(--color-primary), #03C75A)'
    : 'linear-gradient(135deg, #E8F5E9, #C8E6C9)'};
  box-shadow: ${p => p.done
    ? '0 8px 32px rgba(46,125,50,0.4)'
    : '0 4px 20px rgba(46,125,50,0.15)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.5s, box-shadow 0.5s;
  animation: ${p => p.done ? scaleIn : 'none'} 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
`;
const CircleText = styled.div`
  font-family: var(--font);
  font-size: ${p => p.done ? '17px' : '15px'};
  font-weight: 800;
  color: ${p => p.done ? 'white' : 'var(--color-primary)'};
  text-align: center;
  line-height: 1.3;
`;
const MatchingLabel = styled.p`
  margin-top: 32px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-secondary);
  animation: ${fadeSlideUp} 0.4s ease 0.1s both;
`;
const MatchingActivity = styled.p`
  margin-top: 6px;
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text);
  animation: ${fadeSlideUp} 0.4s ease 0.2s both;
`;
const CancelBtn = styled.button`
  margin-top: 36px;
  background: none;
  border: 1.5px solid var(--color-border);
  border-radius: 40px;
  padding: 11px 32px;
  font-family: var(--font);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-secondary);
  cursor: pointer;
  animation: ${fadeSlideUp} 0.4s ease 0.3s both;
  transition: border-color 0.15s, color 0.15s;
  &:hover { border-color: var(--color-primary); color: var(--color-primary); }
`;
const ErrorMsg = styled.p`
  margin-top: 16px;
  font-size: 13px;
  color: #E53935;
  font-weight: 600;
  text-align: center;
`;

/* ─── 컴포넌트 ─── */
export default function Matching() {
    const [selectedType, setSelectedType] = useState('전체');
    const [activities, setActivities]     = useState([]);       // 서버에서 받은 활동 목록
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');

    const [matchingItem, setMatchingItem] = useState(null);     // 현재 매칭 중인 활동 객체
    const [matchDone, setMatchDone]       = useState(false);    // 매칭 완료(2명 이상) 여부
    const [roomId, setRoomId]             = useState(null);     // 배정된 room_id
    const [joinedIds, setJoinedIds]       = useState([]);       // 이미 참여한 activity id 목록
    const [roomItem, setRoomItem]         = useState(null);     // MatchingRoom 에 넘길 활동 객체

    const pollingRef = useRef(null);   // 매칭 status polling interval

    // ── 활동 목록 불러오기 ──────────────────────────────────
    useEffect(() => {
        api.getActivities()
            .then(data => {
                setActivities(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('활동 목록 불러오기 실패:', err);
                setError('활동 목록을 불러오지 못했습니다.');
                setLoading(false);
            });
    }, []);

    // ── 컴포넌트 언마운트 시 polling 정리 ──────────────────
    useEffect(() => {
        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, []);

    // ── 필터 ───────────────────────────────────────────────
    const filtered = selectedType === '전체'
        ? activities
        : activities.filter(a => a.type === selectedType);

    // ── 매칭 참여 ──────────────────────────────────────────
    const handleJoin = async (activity) => {
        setMatchingItem(activity);
        setMatchDone(false);
        setError('');

        try {
            const res = await api.joinMatching(activity.id);
            setRoomId(res.room_id);

            // 3초 대기 후 바로 매칭 완료 처리 (로그인 구현 전 임시)
            pollingRef.current = setTimeout(() => {
                setMatchDone(true);
            }, 3000);

        } catch (err) {
            setMatchingItem(null);
            setError(err.message || '매칭 참여에 실패했습니다.');
        }
    };

    // ── 매칭 취소 ──────────────────────────────────────────
    const handleCancel = async () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        try {
            await api.cancelMatching();
        } catch (e) {
            console.error('매칭 취소 실패:', e);
        }
        setMatchingItem(null);
        setMatchDone(false);
        setRoomId(null);
    };

    // ── 매칭 완료 → 방 입장 ────────────────────────────────
    const handleEnterRoom = () => {
        setJoinedIds(prev => [...prev, matchingItem.id]);
        setRoomItem(matchingItem);
        setMatchingItem(null);
        setMatchDone(false);
    };

    // ── MatchingRoom 종료 ───────────────────────────────────
    const handleRoomEnd = async () => {
        try {
            await api.cancelMatching();
        } catch (e) {
            console.error('방 퇴장 실패:', e);
        }
        setJoinedIds(prev => prev.filter(id => id !== roomItem?.id));
        setRoomItem(null);
        setRoomId(null);
    };

    // ── MatchingRoom 렌더 ───────────────────────────────────
    if (roomItem) {
        return (
            <MatchingRoom
                activity={roomItem}
                roomId={roomId}
                onBack={() => setRoomItem(null)}
                onEnd={handleRoomEnd}
            />
        );
    }

    return (
        <Page>
            <TopBar>
                <h1>환경 보호 활동 참여</h1>
                <p>함께하면 더 큰 변화를 만들 수 있어요</p>
            </TopBar>

            {matchingItem ? (
                /* ── 매칭 대기 화면 ── */
                <MatchingArea>
                    <CircleWrap>
                        <Ring2 size={210} done={matchDone} />
                        <Ring  size={178} done={matchDone} delay="0s" />
                        <Ring  size={155} done={matchDone} delay="0.25s" />
                        <CoreCircle done={matchDone} key={matchDone ? 'done' : 'loading'}>
                            <CircleText done={matchDone}>
                                {matchDone ? '매칭\n완료! 🎉' : '매칭중\n...'}
                            </CircleText>
                        </CoreCircle>
                    </CircleWrap>

                    <MatchingLabel>{matchDone ? '함께할 팀원을 찾았어요!' : '팀원을 찾고 있어요'}</MatchingLabel>
                    <MatchingActivity>{matchingItem.name}</MatchingActivity>

                    {matchDone ? (
                        <JoinBtn
                            joined={false}
                            onClick={handleEnterRoom}
                            style={{ marginTop: 36, padding: '13px 40px', animation: `${fadeSlideUp} 0.4s ease both` }}
                        >
                            확인
                        </JoinBtn>
                    ) : (
                        <CancelBtn onClick={handleCancel}>취소</CancelBtn>
                    )}
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                </MatchingArea>
            ) : (
                /* ── 활동 목록 화면 ── */
                <>
                    <FilterScroll>
                        {ACTIVITY_TYPES.map(f => (
                            <FilterChip key={f} active={selectedType === f} onClick={() => setSelectedType(f)}>
                                {f}
                            </FilterChip>
                        ))}
                    </FilterScroll>

                    <Section>
                        <SectionHeader>
                            <h3>현재 진행 중인 활동</h3>
                            <p>총 {filtered.length}개의 활동</p>
                        </SectionHeader>

                        {loading ? (
                            <EmptyState><p>⏳</p><span>활동 목록을 불러오는 중...</span></EmptyState>
                        ) : error ? (
                            <EmptyState><p>😢 오류</p><span>{error}</span></EmptyState>
                        ) : filtered.length === 0 ? (
                            <EmptyState>
                                <p>😢 진행 중인 활동이 없어요</p>
                                <span>다른 유형으로 필터를 바꿔보세요</span>
                            </EmptyState>
                        ) : (
                            filtered.map(activity => (
                                <ActivityCard key={activity.id}>
                                    <IconCircle>{getIcon(activity.type)}</IconCircle>
                                    <ActivityInfo>
                                        <div className="name">{activity.name}</div>
                                        <div className="desc">{activity.desc}</div>
                                    </ActivityInfo>
                                    <JoinBtn
                                        joined={joinedIds.includes(activity.id)}
                                        onClick={() => {
                                            if (joinedIds.includes(activity.id)) {
                                                setRoomItem(activity);
                                            } else {
                                                handleJoin(activity);
                                            }
                                        }}
                                    >
                                        {joinedIds.includes(activity.id) ? '⏳ 진행중' : '참여하기'}
                                    </JoinBtn>
                                </ActivityCard>
                            ))
                        )}
                    </Section>
                </>
            )}
        </Page>
    );
}