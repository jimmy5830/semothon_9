import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { keyframes as kf } from '@emotion/react';
import { api, getUserId } from '../api';

/* ─── 멤버 proof 상태 → UI 매핑 ─── */
const STATUS = {
    waiting:  { label: '대기 중',     dot: '#B0BEC5', color: '#607D8B', bg: '#ECEFF1' },
    pending:  { label: '인증 검토 중', dot: '#FFA726', color: '#E65100', bg: '#FFF3E0' },
    approved: { label: '인증 완료 ✅', dot: '#66BB6A', color: '#2E7D32', bg: '#E8F5E9' },
    rejected: { label: '반려됨 — 재제출 필요', dot: '#EF5350', color: '#B71C1C', bg: '#FFEBEE' },
};

/* ─── 애니메이션 ─── */
const fadeSlideUp = kf`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const slideInCard = kf`
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
`;

/* ─── Authorize 서브 컴포넌트 (이미지 + 설명 제출) ─── */
const AuthPage    = styled.div`min-height: 100%; display: flex; flex-direction: column; background: var(--color-bg);`;
const AuthHeader  = styled.div`padding: 56px 20px 24px; h2 { font-size: 20px; font-weight: 800; } p { font-size: 13px; color: var(--color-text-secondary); margin-top: 4px; }`;
const PhotoBox    = styled.div`
  margin: 0 16px;
  height: 220px;
  border-radius: var(--radius-lg);
  background: var(--color-primary-pale);
  border: 2px dashed var(--color-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
`;
const PreviewImg  = styled.img`width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0;`;
const PhotoLabel  = styled.span`font-size: 14px; font-weight: 700; color: var(--color-primary); margin-top: 8px;`;
const TextArea    = styled.textarea`
  margin: 16px;
  padding: 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  font-family: var(--font);
  font-size: 14px;
  resize: none;
  height: 100px;
  outline: none;
  &:focus { border-color: var(--color-primary); }
`;
const SubmitBtn   = styled.button`
  margin: 0 16px;
  padding: 17px;
  background: ${p => p.disabled ? 'var(--color-border)' : 'var(--color-primary)'};
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font);
  font-size: 16px;
  font-weight: 800;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
`;
const BackLink    = styled.button`background: none; border: none; color: var(--color-text-secondary); font-size: 14px; font-weight: 700; padding: 16px; cursor: pointer;`;

function Authorize({ onBack, onSubmit, loading }) {
    const [photo, setPhoto]       = useState(null);       // base64 DataURL
    const [desc, setDesc]         = useState('');
    const fileRef = useRef();

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPhoto(ev.target.result);
        reader.readAsDataURL(file);
    };

    const canSubmit = photo && desc.trim().length > 0 && !loading;

    return (
        <AuthPage>
            <AuthHeader>
                <BackLink onClick={onBack}>← 뒤로</BackLink>
                <h2>📸 활동 인증하기</h2>
                <p>사진과 설명으로 나의 실천을 인증해요</p>
            </AuthHeader>

            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

            <PhotoBox onClick={() => fileRef.current.click()}>
                {photo
                    ? <PreviewImg src={photo} alt="인증 사진" />
                    : <>
                        <span style={{ fontSize: 36 }}>📷</span>
                        <PhotoLabel>사진을 선택하세요</PhotoLabel>
                    </>
                }
            </PhotoBox>

            <TextArea
                placeholder="어떤 활동을 했는지 간략히 설명해주세요 (필수)"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                maxLength={200}
            />

            <SubmitBtn disabled={!canSubmit} onClick={() => canSubmit && onSubmit(photo, desc)}>
                {loading ? '제출 중...' : '인증 제출하기'}
            </SubmitBtn>
        </AuthPage>
    );
}

/* ─── MatchingRoom 메인 스타일 ─── */
const Page      = styled.div`min-height: 100%; display: flex; flex-direction: column; background: var(--color-bg);`;
const Header    = styled.div`padding: 52px 16px 12px; background: var(--color-surface); border-bottom: 1px solid var(--color-border);`;
const BackRow   = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;`;
const BackBtn   = styled.button`background: none; border: none; cursor: pointer; color: var(--color-text-secondary); display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; font-family: var(--font); padding: 0;`;
const EndBtn    = styled.button`background: none; border: 1.5px solid #EF9A9A; border-radius: 40px; color: #C62828; font-family: var(--font); font-size: 13px; font-weight: 700; padding: 7px 16px; cursor: pointer;`;
const HeaderTitle = styled.h2`font-size: 17px; font-weight: 800; color: var(--color-text); span { color: var(--color-primary); }`;
const HeaderSub   = styled.p`font-size: 13px; color: var(--color-text-secondary); margin-top: 4px;`;
const StatusPill  = styled.div`
  margin-top: 8px;
  display: inline-block;
  background: #E8F5E9;
  color: #2E7D32;
  border-radius: 40px;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
`;

const FeedArea  = styled.div`flex: 1; padding: 12px 16px; overflow-y: auto;`;
const MemberCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-bottom: 10px;
  border: 2px solid ${p => p.isMe ? 'var(--color-primary)' : 'transparent'};
  box-shadow: var(--shadow-sm);
  animation: ${slideInCard} 0.35s ease ${p => p.delay} both;
`;
const AvatarBubble = styled.div`
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--color-primary-pale);
  border: 2px solid ${p => p.isMe ? 'var(--color-primary)' : 'var(--color-border)'};
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
`;
const CardInfo  = styled.div`flex: 1; min-width: 0;`;
const NameRow   = styled.div`display: flex; align-items: center; gap: 6px; margin-bottom: 6px;`;
const MemberName = styled.span`font-size: 13px; font-weight: 700; color: var(--color-text-secondary);`;
const MeTag     = styled.span`font-size: 10px; font-weight: 800; color: var(--color-primary); background: var(--color-primary-pale); border-radius: 40px; padding: 2px 7px;`;
const StatusBox = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  background: ${p => (STATUS[p.status] || STATUS.waiting).bg};
  border-radius: var(--radius-sm); padding: 9px 13px;
`;
const StatusLeft  = styled.div`display: flex; align-items: center; gap: 7px;`;
const StatusDot   = styled.div`width: 8px; height: 8px; border-radius: 50%; background: ${p => (STATUS[p.status] || STATUS.waiting).dot}; flex-shrink: 0;`;
const StatusLabel = styled.span`font-size: 13px; font-weight: 800; color: ${p => (STATUS[p.status] || STATUS.waiting).color};`;

/* 상대방 proof 이미지 + 승인/반려 버튼 */
const ProofPreview = styled.img`width: 100%; border-radius: 10px; object-fit: cover; max-height: 160px; margin-top: 8px;`;
const ProofDesc    = styled.p`font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;`;
const ActionRow    = styled.div`display: flex; gap: 8px; margin-top: 8px;`;
const ApproveBtn  = styled.button`flex: 1; padding: 9px; border: none; border-radius: var(--radius-sm); background: var(--color-primary); color: white; font-family: var(--font); font-size: 13px; font-weight: 800; cursor: pointer;`;
const RejectBtn   = styled.button`flex: 1; padding: 9px; border: none; border-radius: var(--radius-sm); background: #FFEBEE; color: #C62828; font-family: var(--font); font-size: 13px; font-weight: 800; cursor: pointer;`;

const Toolbar   = styled.div`padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); background: var(--color-surface); border-top: 1px solid var(--color-border); box-shadow: 0 -4px 16px rgba(46,125,50,0.08);`;
const CertifyBtn = styled.button`
  width: 100%;
  background: ${p => p.disabled ? 'var(--color-border)' : 'var(--color-primary)'};
  color: white; border: none; border-radius: var(--radius-md); padding: 17px;
  font-family: var(--font); font-size: 16px; font-weight: 800;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  box-shadow: 0 4px 16px rgba(46,125,50,0.3);
  transition: transform 0.15s, box-shadow 0.15s;
  &:active { transform: scale(0.98); }
`;

/* 종료 모달 */
const Overlay   = styled.div`position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 32px;`;
const Modal     = styled.div`background: var(--color-surface); border-radius: var(--radius-lg); padding: 28px 24px 20px; width: 100%; max-width: 320px; box-shadow: 0 8px 40px rgba(0,0,0,0.18); animation: ${fadeSlideUp} 0.2s ease both;`;
const ModalTitle = styled.p`font-size: 16px; font-weight: 800; color: var(--color-text); text-align: center; line-height: 1.5; margin-bottom: 22px;`;
const ModalBtnRow = styled.div`display: flex; gap: 10px;`;
const ModalBtn  = styled.button`flex: 1; padding: 13px; border-radius: var(--radius-sm); font-family: var(--font); font-size: 15px; font-weight: 800; cursor: pointer; border: none; background: ${p => p.confirm ? '#B71C1C' : 'var(--color-primary-pale)'}; color: ${p => p.confirm ? 'white' : 'var(--color-text)'}; transition: opacity 0.15s; &:active { opacity: 0.8; }`;

/* 이모지 아바타 (이름 첫 글자 기반) */
const AVATARS = ['🌿', '🌱', '♻️', '🌊', '🌍', '🍃', '🌸', '🌻'];
const getAvatar = (userId) => AVATARS[userId % AVATARS.length];

/* ─── 컴포넌트 ─── */
export default function MatchingRoom({ activity, roomId, onBack, onEnd }) {
    const myUserId = getUserId();

    const [members, setMembers]         = useState([]);
    const [proofs, setProofs]           = useState([]);      // [{ user_id, image_url, description, status }]
    const [roomClosed, setRoomClosed]   = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showAuthorize, setShowAuthorize] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [statusMsg, setStatusMsg]     = useState('');
    const pollingRef = useRef(null);

    // ── 방 상태 polling ────────────────────────────────────
    const fetchRoom = useCallback(async () => {
        if (!roomId) return;
        try {
            const room = await api.getRoom(roomId);
            setMembers(room.members);
        } catch (e) {
            console.error('방 상태 조회 실패:', e);
        }
    }, [roomId]);

    const fetchProofs = useCallback(async () => {
        if (!roomId) return;
        try {
            const data = await api.getProofs(roomId);
            setProofs(data);
        } catch (e) {
            console.error('인증 목록 조회 실패:', e);
        }
    }, [roomId]);

    useEffect(() => {
        fetchRoom();
        fetchProofs();
        // 2초마다 멤버 + 인증 목록 갱신
        pollingRef.current = setInterval(() => {
            fetchRoom();
            fetchProofs();
        }, 2000);
        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, [fetchRoom, fetchProofs]);

    // ── 내 인증 상태 계산 ───────────────────────────────────
    const myProof    = proofs.find(p => p.user_id === myUserId);
    const myStatus   = myProof?.status || 'waiting';
    const canCertify = members.length >= 2;

    const certifyText = () => {
        if (!canCertify)            return '⏳ 상대방을 기다리는 중';
        if (myStatus === 'approved') return '✅ 인증 완료!';
        if (myStatus === 'pending')  return '⏳ 인증 검토 중';
        if (myStatus === 'rejected') return '🔄 인증 재제출하기';
        return '📸 내 실천 인증하기';
    };

    // ── 인증 제출 ───────────────────────────────────────────
    const handleSubmitProof = async (photoBase64, description) => {
        setSubmitLoading(true);
        try {
            await api.submitProof(roomId, { image_url: photoBase64, description });
            setShowAuthorize(false);
            setStatusMsg('⏳ 인증 제출 완료! 상대방의 승인을 기다리는 중...');
            setTimeout(() => setStatusMsg(''), 3000);
            await fetchProofs();
        } catch (e) {
            setStatusMsg(`❌ ${e.message}`);
            setTimeout(() => setStatusMsg(''), 3000);
        } finally {
            setSubmitLoading(false);
        }
    };

    // ── 상대방 인증 승인 ────────────────────────────────────
    const handleApprove = async (targetUserId) => {
        try {
            const res = await api.approveProof(roomId, targetUserId);
            setStatusMsg(`✅ ${res.message}`);
            setTimeout(() => setStatusMsg(''), 3000);
            if (res.room_closed) {
                setRoomClosed(true);
                clearInterval(pollingRef.current);
                setTimeout(() => onEnd?.(), 2500);
            } else {
                await fetchProofs();
            }
        } catch (e) {
            setStatusMsg(`❌ ${e.message}`);
            setTimeout(() => setStatusMsg(''), 3000);
        }
    };

    // ── 상대방 인증 반려 ────────────────────────────────────
    const handleReject = async (targetUserId) => {
        try {
            const res = await api.rejectProof(roomId, targetUserId);
            setStatusMsg(`⚠️ ${res.message}`);
            setTimeout(() => setStatusMsg(''), 3000);
            await fetchProofs();
        } catch (e) {
            setStatusMsg(`❌ ${e.message}`);
            setTimeout(() => setStatusMsg(''), 3000);
        }
    };

    // ── 인증 서브페이지 ─────────────────────────────────────
    if (showAuthorize) {
        return (
            <Authorize
                onBack={() => setShowAuthorize(false)}
                onSubmit={handleSubmitProof}
                loading={submitLoading}
            />
        );
    }

    // ── 방 종료 화면 ────────────────────────────────────────
    if (roomClosed) {
        return (
            <Page style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
                <div style={{ fontSize: 64 }}>🎉</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 16 }}>미션 완료!</h2>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 8 }}>
                    모든 인원의 인증이 완료되었습니다.<br />100포인트가 지급되었어요!
                </p>
            </Page>
        );
    }

    const completedCount = proofs.filter(p => p.status === 'approved').length;

    return (
        <Page>
            {/* ── 헤더 ── */}
            <Header>
                <BackRow>
                    <BackBtn onClick={onBack}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        뒤로
                    </BackBtn>
                    <EndBtn onClick={() => setShowConfirm(true)}>활동 종료</EndBtn>
                </BackRow>
                <HeaderTitle>
                    <span>{members.length}명</span>이 함께 진행 중입니다
                </HeaderTitle>
                <HeaderSub>{activity?.name} · 인증 완료 {completedCount}/{members.length}명</HeaderSub>
                {statusMsg && <StatusPill>{statusMsg}</StatusPill>}
            </Header>

            {/* ── 멤버 피드 ── */}
            <FeedArea>
                {members.length === 0 ? (
                    <EmptyState><p>⏳</p><span>멤버 정보를 불러오는 중...</span></EmptyState>
                ) : (
                    members.map((member, i) => {
                        const isMe       = member.user_id === myUserId;
                        const proof      = proofs.find(p => p.user_id === member.user_id);
                        const status     = proof?.status || 'waiting';
                        // 내가 아직 승인/반려 안 한 상대방의 pending 인증
                        const myProofForThem = proofs.find(p => p.user_id === myUserId);
                        const canAct     = !isMe && status === 'pending' && myProofForThem;

                        return (
                            <MemberCard key={member.id} isMe={isMe} delay={`${i * 0.08}s`}>
                                <AvatarBubble isMe={isMe}>{getAvatar(member.user_id)}</AvatarBubble>
                                <CardInfo>
                                    <NameRow>
                                        <MemberName>{member.name}</MemberName>
                                        {isMe && <MeTag>나</MeTag>}
                                    </NameRow>
                                    <StatusBox status={status}>
                                        <StatusLeft>
                                            <StatusDot status={status} />
                                            <StatusLabel status={status}>
                                                {(STATUS[status] || STATUS.waiting).label}
                                            </StatusLabel>
                                        </StatusLeft>
                                    </StatusBox>

                                    {/* 상대방 인증 사진 + 승인/반려 버튼 */}
                                    {!isMe && proof && proof.image_url && (
                                        <>
                                            <ProofPreview src={proof.image_url} alt="인증 사진" />
                                            <ProofDesc>{proof.description}</ProofDesc>
                                        </>
                                    )}
                                    {canAct && (
                                        <ActionRow>
                                            <ApproveBtn onClick={() => handleApprove(member.user_id)}>
                                                ✅ 승인
                                            </ApproveBtn>
                                            <RejectBtn onClick={() => handleReject(member.user_id)}>
                                                ❌ 반려
                                            </RejectBtn>
                                        </ActionRow>
                                    )}
                                </CardInfo>
                            </MemberCard>
                        );
                    })
                )}
            </FeedArea>

            {/* ── 인증 버튼 ── */}
            <Toolbar>
                <CertifyBtn
                    disabled={!canCertify || myStatus === 'approved' || myStatus === 'pending'}
                    onClick={() => {
                        if (canCertify && myStatus !== 'approved' && myStatus !== 'pending') {
                            setShowAuthorize(true);
                        }
                    }}
                >
                    {certifyText()}
                </CertifyBtn>
            </Toolbar>

            {/* ── 활동 종료 확인 모달 ── */}
            {showConfirm && (
                <Overlay>
                    <Modal>
                        <ModalTitle>정말로 활동을 종료하겠습니까?</ModalTitle>
                        <ModalBtnRow>
                            <ModalBtn onClick={() => { setShowConfirm(false); onEnd?.(); }}>네</ModalBtn>
                            <ModalBtn confirm onClick={() => setShowConfirm(false)}>아니오</ModalBtn>
                        </ModalBtnRow>
                    </Modal>
                </Overlay>
            )}
        </Page>
    );
}

/* ─── 인라인 EmptyState (MatchingRoom 전용) ─── */
const EmptyState = styled.div`
  text-align: center; padding: 48px 20px;
  p    { font-size: 32px; margin-bottom: 8px; }
  span { font-size: 14px; color: var(--color-text-secondary); }
`;