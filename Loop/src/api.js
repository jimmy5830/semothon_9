// ─────────────────────────────────────────────────────────────
// Loop API 클라이언트
//   - 백엔드: http://localhost:8000
//   - 인증 방식: ?user_id=N (JWT 전환 전 임시)
//   - 사용법: import { api } from '../api';
// ─────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:8000';

/** localStorage에서 현재 로그인 유저 id 반환 (기본값 1) */
export const getUserId = () => parseInt(localStorage.getItem('user_id') || '1', 10);
export const setUserId = (id) => localStorage.setItem('user_id', String(id));

/** 쿼리 파라미터 + user_id 붙인 URL 생성 */
const buildUrl = (path, params = {}) => {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('user_id', getUserId());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
};

/** 공통 fetch 래퍼 */
const request = async (method, path, body = null, params = {}) => {
  const options = { method, headers: {} };

  if (body !== null) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const res = await fetch(buildUrl(path, params), options);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const msg = err.detail || '서버 오류가 발생했습니다.';
    console.error(`[API ERROR] ${method} ${path} →`, msg);
    throw new Error(msg);
  }

  return res.json();
};

/** Form 데이터 전송 (auth용) */
const formRequest = async (path, formData) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,          // Content-Type 헤더 브라우저가 자동 설정
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || '서버 오류');
  }
  return res.json();
};

// ─────────────────────────────────────────────────────────────
// API 함수 모음
// ─────────────────────────────────────────────────────────────
export const api = {

  // ── Auth ──────────────────────────────────────────────────
  register: ({ email, phone, password, name }) => {
    const fd = new FormData();
    fd.append('email', email);
    fd.append('phone', phone);
    fd.append('password', password);
    fd.append('name', name);
    return formRequest('/auth/register', fd);
  },

  login: ({ email, password }) => {
    const fd = new FormData();
    fd.append('email', email);
    fd.append('password', password);
    return formRequest('/auth/login', fd);
  },

  // ── Users ─────────────────────────────────────────────────
  /** GET /users/me → { id, name, profile_image, points } */
  getMe: () => request('GET', '/users/me'),

  /** PUT /users/me → { id, name, profile_image, points } */
  updateMe: (data) => request('PUT', '/users/me', data),

  /** DELETE /users/me */
  deleteMe: () => request('DELETE', '/users/me'),

  // ── Records ───────────────────────────────────────────────
  /** GET /users/me/records → [{ id, content }] */
  getRecords: () => request('GET', '/users/me/records'),

  /** DELETE /users/me/records/{id} */
  deleteRecord: (id) => request('DELETE', `/users/me/records/${id}`),

  // ── Points ────────────────────────────────────────────────
  /** GET /users/me/points → { points } */
  getPoints: () => request('GET', '/users/me/points'),

  /** POST /users/me/points?amount=N */
  addPoints: (amount = 10) => request('POST', '/users/me/points', null, { amount }),

  // ── Activities ────────────────────────────────────────────
  /** GET /activities → [{ id, name, type, desc }] */
  getActivities: () => request('GET', '/activities'),

  // ── Matching ──────────────────────────────────────────────
  /** POST /matching/join/{activityId} → { room_id, can_certify } */
  joinMatching: (activityId) => request('POST', `/matching/join/${activityId}`),

  /** GET /matching/status → { room_id, can_certify } */
  getMatchingStatus: () => request('GET', '/matching/status'),

  /** DELETE /matching/cancel */
  cancelMatching: () => request('DELETE', '/matching/cancel'),

  // ── Rooms ─────────────────────────────────────────────────
  /**
   * GET /rooms/{roomId}
   * → { room_id, activity_id, capacity, can_certify, members: [{ id, user_id, name, status }] }
   * status: waiting | pending | approved | rejected
   */
  getRoom: (roomId) => request('GET', `/rooms/${roomId}`),

  // ── Proof ─────────────────────────────────────────────────
  /** POST /rooms/{roomId}/proof  body: { image_url, description } */
  submitProof: (roomId, { image_url, description }) =>
    request('POST', `/rooms/${roomId}/proof`, { image_url, description }),

  /** GET /rooms/{roomId}/proofs → [{ user_id, image_url, description, status }] */
  getProofs: (roomId) => request('GET', `/rooms/${roomId}/proofs`),

  /** POST /rooms/{roomId}/approve?target_user_id=N → { message, room_closed } */
  approveProof: (roomId, targetUserId) =>
    request('POST', `/rooms/${roomId}/approve`, null, { target_user_id: targetUserId }),

  /** POST /rooms/{roomId}/reject?target_user_id=N */
  rejectProof: (roomId, targetUserId) =>
    request('POST', `/rooms/${roomId}/reject`, null, { target_user_id: targetUserId }),
};
