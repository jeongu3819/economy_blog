# StockBlog AI (v2.0)

종목 티커만 입력하면 **StockTitan 최신 뉴스 수집**과 **ChatGPT (newstock GPT) 자동 질의**를 통해 완성된 형태의 **블로그 글 원고**를 생성해주는 자동화 플랫폼입니다. 기존 Node.js 모놀리식 구조에서 Python(FastAPI) 백엔드와 React 프론트엔드로 재구성되었습니다.

## 🌟 주요 특징 (v2.0 업데이트)

- **백엔드/프론트엔드 분리**: `backend` (Python/FastAPI)와 `frontend` (React/Vite)로 완벽히 분리.
- **StockTitan 스크래핑 추가**: 최신 뉴스/공시 데이터를 먼저 직접 수집하여 프롬프트에 제공.
- **안정적인 Playwright 세션 관리**: Persistent Context 방식을 통해 ChatGPT의 로그인 세션을 영구적으로 재사용.
- **스마트 Fallback URL**: 직접 URL 접근 실패 시 `chatgpt.com` 사이드바에서 `newstock` GPT를 자동으로 탐색하여 클릭.
- **섹션 파싱**: 응답을 텍스트 덩어리가 아닌 5개의 구조화된 섹션(기업개요, 뉴스, 공시, 공매도, 트레이더관점)으로 파싱하고 블로그 HTML로 렌더링.
- **세션 상태 확인 API**: 시작 전 프론트엔드에서 ChatGPT 연결 및 로그인 상태를 점검 가능.

---

## 🚀 빠른 시작 가이드 (Quick Start)

### 1단계: 저장소 준비
먼저 [backend 가이드](./backend/README.md)에 따라 `playwright install chromium` 및 필요한 파이썬 라이브러리를 설치합니다.

### 2단계: 자동 로그인 세션 만들기 (최초 1회 필수)
로그인 세션 만료로 인한 자동화 실패를 막기 위해, 스크립트 전용 브라우저 세션을 하나 준비합니다.
명령프롬프트나 터미널에서 다음을 실행하세요:

```bash
cd backend
python -c "from playwright.sync_api import sync_playwright; p=sync_playwright().start(); ctx=p.chromium.launch_persistent_context('./playwright-session', headless=False); page=ctx.new_page(); page.goto('https://chatgpt.com/'); input('로그인 완료 후 Enter를 누르세요...'); ctx.close(); p.stop()"
```

1. 브라우저 창이 열리면 `https://chatgpt.com/`으로 이동합니다.
2. 수동으로 로그인합니다 (구글 로그인 추천).
3. 로그인이 완료되면 다시 터미널 창으로 돌아와 `Enter` 키를 눌러 창을 닫습니다.
4. 이제 로그인 세션이 `.playwright-session/` 폴더에 완벽히 저장되었습니다.

### 3단계: 통합 환경 실행 (Concurrent)
프로젝트 루트 폴더에서 다음을 실행하면 백엔드 도메인(8000)과 프론트엔드(5173)가 동시에 실행됩니다.

```bash
npm install
npm run dev
```

> 위 명령은 루트 디렉토리의 package.json을 이용해 클라이언트와 서버를 동시에 켭니다. 만약 백/프 구분해서 각각 실행하고 싶다면 하위 폴더에서 터미널을 따로 열어주세요.

### 4단계: 접속하기
웹 브라우저를 열고 `http://localhost:5173` 에 접속합니다.
1. 우측 상단의 "상태 확인" 버튼을 눌러 ChatGPT 연결 및 로그인 상태가 정상인지 체크하세요.
2. 분석할 티커(예: TSLA, AMD, NVDA)를 입력하고 분석을 시작합니다.
3. 원고 생성이 완료되면 결과를 확인하고 복사하세요!

---

## 📂 디렉토리 구조 설명

```
project-root/
│
├── backend/                  # Python 기반 서버
│   ├── app/                  # FastAPI 애플리케이션
│   │   ├── api/routes/       # API 라우트 정의 (stock.py 등)
│   │   ├── services/         # 비즈니스 로직 (크롤링, GPT 자동화, 블로그 변환)
│   │   ├── schemas/          # Pydantic 데이터 모델
│   │   ├── core/             # 각종 설정 및 유틸
│   │   └── utils/            # 셀렉터, 대기, 딜레이 유틸 등
│   ├── tests/                # 백엔드 테스트 코드
│   ├── requirements.txt      # 파이썬 의존성
│   └── README.md             # 백엔드 전용 설명서
│
├── frontend/                 # React 환경
│   ├── src/
│   │   ├── api/              # Axios 기반 API 연동 모듈
│   │   ├── components/       # 재사용 가능한 UI 컴포넌트
│   │   ├── App.jsx           # 메인 애플리케이션 뷰
│   │   ├── main.jsx          # 엔트리 포인트
│   │   └── ...css files      # V4 기반 Tailwind CSS 및 전역 스타일
│   ├── vite.config.js
│   └── package.json          # 프론트 의존성
│
├── .gitignore                # 자동생성 폴더/캐시 무시 설정
├── package.json              # 상위 동시 실행 래퍼 (npm run dev)
└── README.md                 # 본 파일
```

## 🛠️ 자주 나오는 질문 & 문제 해결

**Q. 자동화 브라우저가 보이지 않습니다.**
백엔드 폴더의 `.env` 파일 내부에서 `AUTOMATION_HEADLESS=false`인지 확인하세요. 만약 `true`면 백그라운드로 실행됩니다. 디버그나 로딩 과정 감시를 원한다면 `false`를 유지하세요.

**Q. 'ChatGPT 접속 실패' 오류가 계속 나옵니다.**
세션이 끊어졌을 수 있습니다. 루트나 백엔드 터미널을 종료한 후 위 **2단계**를 다시 한번 수행해주세요.

**Q. "상태 확인"은 왜 필요한가요?**
ChatGPT 서버 장애, 네트워크 이상, 또는 세션 만료를 작업을 시작하기도 전에 파악하기 위해서입니다. (사용자 경험 상승 목적)
