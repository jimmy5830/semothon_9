import React, { useState } from 'react';
import Authorize from './Authorize';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

/* ─── 애니메이션 ─── */
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideInCard = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
`;

/* ─── 상태 설정 ─── */
const STATUS = {
    waiting:   { label: '진행 중',   color: '#5A7260', bg: '#F0F4F0', dot: '#9E9E9E' },
    started:   { label: '실천 시작!', color: '#E65100', bg: '#FFF3E0', dot: '#FF8F00' },

    pending:   { label: '인증 검토중', color: '#1565C0', bg: '#E3F2FD', dot: '#42A5F5' },

    completed: { label: '실천 완료!', color: '#2E7D32', bg: '#E8F5E9', dot: '#4CAF50' },
};

/* ─── 임시 참여자 데이터 ─── */
const MOCK_MEMBERS = [
    { id: 1, name: '부지런한 북극곰', avatar: '🐻‍❄️', status: 'waiting',   time: '오후 2:14' },
    { id: 2, name: '나',             avatar: '🙋',    status: 'waiting',   time: '오후 2:14', isMe: true },
    { id: 3, name: '올찬 고양이',    avatar: '🐱',    status: 'completed', time: '오후 2:31' },
];

/* ─── 스타일 ─── */
const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg);
`;

const Header = styled.div`
  padding: 52px 20px 16px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
`;

const BackRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
  transition: color 0.15s;
  &:hover { color: var(--color-primary); }
`;

const EndBtn = styled.button`
  background: #FFF0F0;
  border: 1.5px solid #FFCDD2;
  border-radius: 40px;
  padding: 6px 14px;
  font-family: var(--font);
  font-size: 12px;
  font-weight: 800;
  color: #B71C1C;
  cursor: pointer;
  transition: background 0.15s;
  &:active { background: #FFCDD2; }
`;

const HeaderTitle = styled.h2`
  font-size: 19px;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.3;

  span {
    color: var(--color-primary);
  }
`;

const HeaderSub = styled.p`
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 3px;
  font-weight: 600;
`;

const FeedArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const MemberCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-sm);
  border: 1.5px solid ${p => p.isMe ? 'var(--color-primary)' : 'transparent'};
  animation: ${slideInCard} 0.35s ease ${p => p.delay} both;
`;

const AvatarBubble = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary-pale);
  border: 2px solid ${p => p.isMe ? 'var(--color-primary)' : 'var(--color-border)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
`;

const CardInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
`;

const MemberName = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary);
`;

const MeTag = styled.span`
  font-size: 10px;
  font-weight: 800;
  color: var(--color-primary);
  background: var(--color-primary-pale);
  border-radius: 40px;
  padding: 2px 7px;
`;

const StatusBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${p => STATUS[p.status].bg};
  border-radius: var(--radius-sm);
  padding: 9px 13px;
`;

const StatusLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => STATUS[p.status].dot};
  flex-shrink: 0;
`;

const StatusLabel = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: ${p => STATUS[p.status].color};
`;

const TimeLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${p => STATUS[p.status].color};
  opacity: 0.7;
`;

/* ─── 하단 인증 툴바 ─── */
const Toolbar = styled.div`
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -4px 16px rgba(46,125,50,0.08);
`;

const CertifyBtn = styled.button`
  width: 100%;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 17px;
  font-family: var(--font);
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(46,125,50,0.3);
  transition: transform 0.15s, box-shadow 0.15s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(46,125,50,0.2);
  }
`;

/* ─── 경고 모달 ─── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
`;

const Modal = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 28px 24px 20px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  animation: ${fadeSlideUp} 0.2s ease both;
`;

const ModalTitle = styled.p`
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text);
  text-align: center;
  line-height: 1.5;
  margin-bottom: 22px;
`;

const ModalBtnRow = styled.div`
  display: flex;
  gap: 10px;
`;

const ModalBtn = styled.button`
  flex: 1;
  padding: 13px;
  border-radius: var(--radius-sm);
  font-family: var(--font);
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  border: none;
  background: ${p => p.confirm ? '#B71C1C' : 'var(--color-primary-pale)'};
  color: ${p => p.confirm ? 'white' : 'var(--color-text)'};
  transition: opacity 0.15s;
  &:active { opacity: 0.8; }
`;

/* ─── 컴포넌트 ─── */
export default function MatchingRoom({ activity, onBack, onEnd, onConfirm }) {
    const [members, setMembers] = useState(MOCK_MEMBERS);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showAuthorize, setShowAuthorize] = useState(false);
    const [successText, setSuccessText] = useState('');

    const approveRecord = (id) => {
    const records = JSON.parse(localStorage.getItem('records')) || [];

    const updated = records.map(r =>
    r.id === id ? { ...r, status: 'completed' } : r
    );

  localStorage.setItem('records', JSON.stringify(updated));

  window.dispatchEvent(new Event('storage'));
};

    const handleCertify = () => {
        // 내 상태를 '실천 시작!'으로 변경 (추후 이미지 업로드 연동)
        setMembers(prev =>
            prev.map(m =>
                m.isMe
                    ? { ...m, status: m.status === 'waiting' ? 'started' : 'completed', time: '오후 2:35' }
                    : m
            )
        );
        alert('📸 이미지 업로드는 백엔드 연동 후 구현 예정이에요!');
    };

    const myStatus = members.find(m => m.isMe)?.status;
    const completedCount = members.filter(m => m.status === 'completed').length;

    // ✅ 방 전체 완료 여부
    const allCompleted = members.every(m => m.status === 'completed');

    // ✅ 버튼 텍스트를 명확하게 분리
    let certifyText = '📸 내 실천 인증하기';

    if (myStatus === 'completed') {
      certifyText = '✅ 실천 완료!';
  } else if (myStatus === 'pending') {
    certifyText = '⏳ 인증 검토 중';
  } else if (!allCompleted) {
    certifyText = '⏳ 진행 중';
  }

    // 인증 페이지
    if (showAuthorize) {
        return (
            <Authorize
                onBack={() => setShowAuthorize(false)}
                onSubmit={(photo, description) => {
    setMembers(prev => {
        const updatedMembers = prev.map(m =>
            m.isMe
                ? { ...m, status: 'pending', time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) }
                : m
        );

        // 방 전체 완료 체크 후 roomStatus 결정
        const allDone = updatedMembers.every(m => m.status === 'completed');
        if (allDone) {
            console.log('모든 멤버 완료! 방 상태를 completed로 변경 가능');
        }

        return updatedMembers;
    });

    onConfirm?.(photo, description);

    setSuccessText('⏳ 인증 검토 중입니다');
    setTimeout(() => {
        setShowAuthorize(false);
        setSuccessText('');
    }, 2000);
}}
            />
        );
    }

    return (
        <Page>
            {/* ── 상단 헤더 ── */}
            <Header>
                <BackRow>
                    <BackBtn onClick={onBack}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </BackBtn>
                    <EndBtn onClick={() => setShowConfirm(true)}>활동 종료</EndBtn>
                </BackRow>
                <HeaderTitle>
                    <span>{members.length}명</span>이 함께 진행 중입니다...
                </HeaderTitle>
                <HeaderSub>
                    {activity?.name} · 완료 {completedCount}/{members.length}명
                </HeaderSub>
                {successText && (
                    <div style={{
                        marginTop: 8,
                        background: '#E8F5E9',
                        color: '#2E7D32',
                        borderRadius: 40,
                        fontSize: 13,
                        fontWeight: 700,
                        padding: '8px 12px',
                        display: 'inline-block'
                    }}>
                        {successText}
                    </div>
                )}
            </Header>

            {/* ── 참여자 피드 ── */}
            <FeedArea>
                {members.map((member, i) => (
                    <MemberCard key={member.id} isMe={member.isMe} delay={`${i * 0.08}s`}>
                        <AvatarBubble isMe={member.isMe}>{member.avatar}</AvatarBubble>
                        <CardInfo>
                            <NameRow>
                                <MemberName>{member.name}</MemberName>
                                {member.isMe && <MeTag>나</MeTag>}
                            </NameRow>
                            <StatusBox status={member.status}>
                                <StatusLeft>
                                    <StatusDot status={member.status} />
                                    <StatusLabel status={member.status}>
                                        {STATUS[member.status].label}
                                    </StatusLabel>
                                </StatusLeft>
                                <TimeLabel status={member.status}>{member.time}</TimeLabel>
                            </StatusBox>
                        </CardInfo>
                    </MemberCard>
                ))}
            </FeedArea>

            {/* ── 하단 인증 툴바 ── */}
            <Toolbar>
                <CertifyBtn onClick={() => setShowAuthorize(true)}>
    {certifyText}
</CertifyBtn>
            </Toolbar>

            {/* ── 활동 종료 확인 모달 ── */}
            {showConfirm && (
                <Overlay>
                    <Modal>
                        <ModalTitle>{'정말로 활동을 종료하겠습니까?'}
                            </ModalTitle>
                            <ModalBtnRow>
                            <ModalBtn onClick={() => { setShowConfirm(false); onEnd(); }}>
                            네
                            </ModalBtn>
                            <ModalBtn confirm onClick={() => setShowConfirm(false)}>
                            아니오
                        </ModalBtn>
                    </ModalBtnRow>
                </Modal>
                </Overlay>
                )}
        </Page>
    );
}