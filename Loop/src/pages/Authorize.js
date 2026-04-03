import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

/* ─── 애니메이션 ─── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── 스타일 ─── */
const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FAFAF8;
  animation: ${fadeIn} 0.25s ease both;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 52px 16px 12px;
  border-bottom: 1px solid #D0CFC8;
  background: #FAFAF8;
`;

const BackBtn = styled.button`
  width: 36px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: #1C1C1A;
  transition: opacity 0.15s;
  &:active { opacity: 0.6; }
`;

const HeaderTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: #1C1C1A;
  letter-spacing: -0.3px;
`;

const HeaderSpacer = styled.div`
  width: 36px;
`;

const Body = styled.div`
  flex: 1;
  padding: 24px 20px;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Subtitle = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: #1C1C1A;
  margin-bottom: 20px;
  letter-spacing: -0.4px;
`;

/* 이미지 박스 */
const ImageBox = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: #F0EFEA;
  border-radius: 12px;
  border: 1.5px solid #D0CFC8;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: border-color 0.15s;
  &:hover { border-color: var(--color-primary); }
`;

const SelectedImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const DiagLine = styled.div`
  position: absolute;
  width: 90%;
  height: 1px;
  background: #D0CFC8;
  transform: ${p => p.right ? 'rotate(-45deg)' : 'rotate(45deg)'};
`;

const InnerBorder = styled.div`
  position: absolute;
  inset: 12px;
  border: 1px solid #D0CFC8;
  border-radius: 4px;
`;

const PlaceholderHint = styled.p`
  position: absolute;
  font-size: 13px;
  font-weight: 700;
  color: #9E9D96;
  bottom: 20px;
  width: 100%;
  text-align: center;
`;

/* 하단 행 */
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const RecentBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font);
  font-size: 14px;
  font-weight: 600;
  color: #5E5E5A;
  padding: 4px 0;
  transition: color 0.15s;
  &:hover { color: var(--color-primary); }
`;

const SelectBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: #EBF5EC;
  border: 1px solid #C5DEC7;
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--font);
  font-size: 14px;
  font-weight: 700;
  color: #3A7D44;
  transition: background 0.15s;
  &:active { background: #C5DEC7; }
`;

/* 푸터 */
const Footer = styled.div`
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
  background: #FAFAF8;
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 17px;
  background: ${p => p.disabled ? '#F0EFEA' : '#03C75A'};
  color: ${p => p.disabled ? '#9E9D96' : '#FFFFFF'};
  border: none;
  border-radius: 12px;
  font-family: var(--font);
  font-size: 16px;
  font-weight: 700;
  cursor: ${p => p.disabled ? 'default' : 'pointer'};
  letter-spacing: -0.3px;
  box-shadow: ${p => p.disabled ? 'none' : '0 4px 16px rgba(3, 199, 90, 0.3)'};
  transition: all 0.15s;
  &:active { opacity: ${p => p.disabled ? 1 : 0.88}; }
`;

/* 숨긴 파일 input */
const HiddenInput = styled.input`
  display: none;
`;

const scaleIn = keyframes`
  0%   { transform: scale(0.7); opacity: 0; }
  60%  { transform: scale(1.08); }
  100% { transform: scale(1);   opacity: 1; }
`;

const fadeOut = keyframes`
  0%   { opacity: 1; }
  100% { opacity: 0; }
`;

const pulseRing = keyframes`
  0%   { transform: scale(0.85); opacity: 0.6; }
  50%  { transform: scale(1.05); opacity: 0.15; }
  100% { transform: scale(0.85); opacity: 0.6; }
`;

const pulseRing2 = keyframes`
  0%   { transform: scale(0.75); opacity: 0.4; }
  50%  { transform: scale(1.15); opacity: 0.08; }
  100% { transform: scale(0.75); opacity: 0.4; }
`;

const CompletionOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.72);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 24px;
  animation: ${p => p.removing ? fadeOut : 'none'} 0.4s ease forwards;
  backdrop-filter: blur(2px);
`;

const CompletionPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #E8F5E9 0%, #F1F8F5 100%);
  gap: 20px;
  animation: ${p => p.removing ? fadeOut : fadeIn} 0.4s ease forwards;
  padding: 20px;
`;

const CompletionWrap = styled.div`
  position: relative;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CompletionRing = styled.div`
  position: absolute;
  border-radius: 50%;
  background: rgba(3, 199, 90, 0.2);
  animation: ${pulseRing} 1.8s ease-in-out infinite;
  animation-delay: ${p => p.delay || '0s'};
  width: ${p => p.size}px;
  height: ${p => p.size}px;
  border: 2px solid rgba(3, 199, 90, 0.4);
`;

const CompletionRing2 = styled.div`
  position: absolute;
  border-radius: 50%;
  background: rgba(3, 199, 90, 0.1);
  animation: ${pulseRing2} 1.8s ease-in-out infinite;
  animation-delay: 0.3s;
  width: ${p => p.size}px;
  height: ${p => p.size}px;
  border: 1px solid rgba(3, 199, 90, 0.2);
`;

const CompletionCircle = styled.div`
  position: relative;
  z-index: 2;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #66D78A);
  box-shadow: 0 12px 48px rgba(3, 199, 90, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 900;
  color: white;
  letter-spacing: -0.5px;
  animation: ${scaleIn} 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
  border: 3px solid rgba(255, 255, 255, 0.2);
`;

const CompletionText = styled.p`
  font-size: 28px;
  font-weight: 900;
  color: white;
  text-align: center;
  line-height: 1.3;
  letter-spacing: -0.5px;
  animation: ${fadeIn} 0.4s ease 0.15s both;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

/* ─── 컴포넌트 ─── */
export default function Authorize({ onBack, onSubmit }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 사진 압축 함수
    const compressImage = (file, maxWidth = 400, quality = 0.3) => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // 비율 유지하면서 최대 너비에 맞춤
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;

          // 이미지 그리기
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 압축된 DataURL 생성
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };

        img.src = URL.createObjectURL(file);
      });
    };

    // 사진 압축 후 저장
    compressImage(file).then((compressedImage) => {
      setSelectedImage(compressedImage);
      setSelectedFile(file);
    });
  };

  const openGallery = () => fileInputRef.current?.click();

  const handleSubmit = () => {
    if (!selectedImage) {
      alert('인증할 사진을 선택해주세요.');
      return;
    }
    // TODO: API 연동 — FormData로 이미지 업로드
    setSubmitted(true);
    setDone(true);
    
    // 3초 후 fadeOut 시작
    setTimeout(() => {
      setRemoving(true);
    }, 3000);
    
    // 3.4초 후 오버레이 제거 및 콜백 호출
    setTimeout(() => {
      setDone(false);
      setRemoving(false);
      onSubmit?.(selectedImage, description.trim());
    }, 3400);
  };

  const handleChangePhoto = () => {
    setSubmitted(false);
    setSelectedImage(null);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  return (
      done ? (
        <CompletionPage removing={removing}>
          <CompletionWrap>
            <CompletionRing2 size={210} />
            <CompletionRing size={178} delay="0s" />
            <CompletionRing size={155} delay="0.25s" />
            <CompletionCircle>작성완료!</CompletionCircle>
          </CompletionWrap>
        </CompletionPage>
      ) : (
      <Page>
        {/* ── 헤더 ── */}
        <Header>
          <BackBtn onClick={onBack}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M14 17L8 11L14 5" stroke="currentColor" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </BackBtn>
          <HeaderTitle>인증</HeaderTitle>
          <HeaderSpacer />
        </Header>

        {/* ── 본문 ── */}
        <Body>
          <Subtitle>{submitted ? '인증 대기 중입니다..' : '오늘의 실천을 인증해주세요.'}</Subtitle>

          {/* 이미지 선택 영역 */}
          <ImageBox onClick={submitted ? undefined : openGallery} style={{ cursor: submitted ? 'default' : 'pointer' }}>
            {selectedImage ? (
                <>
                  <SelectedImg src={selectedImage} alt="선택된 인증 사진" />
                  {submitted && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', gap: 10,
                      }}>
                        <div style={{
                          background: 'rgba(255,255,255,0.92)',
                          borderRadius: 40, padding: '10px 22px',
                          fontSize: 15, fontWeight: 800, color: '#2E7D32',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <span>⏳</span> 인증 검토 중
                        </div>
                      </div>
                  )}
                </>
            ) : (
                <Placeholder>
                  <DiagLine />
                  <DiagLine right />
                  <InnerBorder />
                  <PlaceholderHint>사진을 탭해서 선택하세요</PlaceholderHint>
                </Placeholder>
            )}
          </ImageBox>

          {/* 설명 입력 */}
          <div style={{ marginTop: 18 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#52514A' }}>
              사진 설명
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={submitted}
              placeholder="무엇을 했는지 간단히 적어보세요"
              style={{
                width: '100%',
                minHeight: 80,
                border: '1.5px solid #D0CFC8',
                borderRadius: 10,
                padding: '10px 12px',
                fontFamily: 'var(--font)',
                fontSize: 14,
                resize: 'vertical',
                color: '#1C1C1A',
                background: submitted ? '#F4F4F3' : 'white',
              }}
            />
          </div>

          {/* 최근 항목 / 선택 버튼 — 제출 전에만 표시 */}
          {!submitted && (
              <Row>
                <RecentBtn onClick={openGallery}>최근 항목 ›</RecentBtn>
                <SelectBtn onClick={openGallery}>
                  <span style={{ fontSize: 15 }}>⊞</span>
                  선택
                </SelectBtn>
              </Row>
          )}
        </Body>

        {/* ── 작성 완료 ── */}
        <Footer>
          {submitted ? (
              <SubmitBtn onClick={handleChangePhoto}>
                사진 변경
              </SubmitBtn>
          ) : (
              <SubmitBtn disabled={!selectedImage} onClick={handleSubmit}>
                작성 완료
              </SubmitBtn>
          )}
        </Footer>

        {/* 숨긴 파일 input */}
        <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
        />
      </Page>
      )
  );
}