import { useState, useEffect } from 'react';
import initialData from './data.json';
import { ChevronLeft, ChevronRight, Edit2, CheckCircle, XCircle, Save, X } from 'lucide-react';
import './App.css';

// 데이터 타입 정의
interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string[];
  vocabulary: string;
  concept: string;
}

function App() {
  const [questions, setQuestions] = useState<Question[]>(() => [...(initialData.questions as Question[])].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hideAnswers, setHideAnswers] = useState(true);
  
  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editJsonValue, setEditJsonValue] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];

  // 문제 이동 시 상태 초기화
  useEffect(() => {
    setSelectedOptions([]);
    setIsEditing(false);
    setJsonError(null);
    setIsSubmitted(!hideAnswers);
  }, [currentIndex, hideAnswers]);

  // 옵션 선택 핸들러
  const handleOptionClick = (option: string) => {
    if (isSubmitted) return; // 제출 후엔 선택 불가

    const optionLabel = option.split('.')[0]; // "A. Text" -> "A"
    
    if (selectedOptions.includes(optionLabel)) {
      setSelectedOptions(prev => prev.filter(o => o !== optionLabel));
    } else {
      setSelectedOptions(prev => [...prev, optionLabel]);
    }
  };

  // 정답 제출
  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  // 문제 수정 모드 진입
  const handleEditClick = () => {
    setEditJsonValue(JSON.stringify(currentQuestion, null, 2));
    setIsEditing(true);
    setJsonError(null);
  };

  // 수정 내용 저장
  const handleSaveEdit = () => {
    try {
      const parsed = JSON.parse(editJsonValue);
      
      // 유효성 검사 (간단하게 필수 필드 확인)
      if (!parsed.id || !parsed.question || !parsed.answer) {
        throw new Error("JSON 형식이 올바르지 않습니다. 필수 필드(id, question, answer)를 확인하세요.");
      }

      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = parsed;
      setQuestions(updatedQuestions);
      setIsEditing(false);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  // 정답 체크 로직
  const isCorrect = (optionLabel: string) => currentQuestion.answer.includes(optionLabel);
  const isSelected = (optionLabel: string) => selectedOptions.includes(optionLabel);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Oracle 1Z0-082 Drill</h1>
        <div className="progress">
          문제 {currentIndex + 1} / {questions.length}
        </div>
      </header>

      <main className="card-container">
        {/* 네비게이션 버튼 (이전) */}
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="nav-btn"
        >
          <ChevronLeft size={32} />
        </button>

        {/* 메인 카드 영역 */}
        <div className="card">
          {isEditing ? (
            /* 수정 모드 (JSON 에디터) */
            <div className="editor-mode">
              <div className="editor-header">
                <h3>JSON 데이터 수정</h3>
                <button onClick={() => setIsEditing(false)} className="close-btn"><X /></button>
              </div>
              <textarea 
                value={editJsonValue}
                onChange={(e) => setEditJsonValue(e.target.value)}
                className="json-textarea"
              />
              {jsonError && <div className="error-msg">{jsonError}</div>}
              <button onClick={handleSaveEdit} className="save-btn">
                <Save size={16} /> 변경사항 저장
              </button>
            </div>
          ) : (
            /* 문제 풀이 모드 */
            <>
              <div className="card-header">
                <div className="header-left">
                  <span className="q-id">Q{currentQuestion.id}</span>
                  <button 
                    onClick={() => {
                      const newHideAnswers = !hideAnswers;
                      setHideAnswers(newHideAnswers);
                      if (!newHideAnswers) {
                        setIsSubmitted(true);
                      }
                    }} 
                    className="toggle-btn"
                    title={hideAnswers ? "정답 표시" : "정답 가리기"}
                  >
                    {hideAnswers ? '답 가리기: ON' : '답 가리기: OFF'}
                  </button>
                </div>
                <button onClick={handleEditClick} className="edit-btn" title="JSON 수정">
                  <Edit2 size={16} /> 수정
                </button>
              </div>
              
              <h2 className="question-text">{currentQuestion.question}</h2>

              <div className="options-list">
                {currentQuestion.options.map((opt) => {
                  const label = opt.split('.')[0];
                  let className = "option-item";
                  
                  if (isSelected(label)) className += " selected";
                  
                  // 답 가리기 OFF일 경우 항상 정답 표시
                  if (!hideAnswers && isCorrect(label)) className += " correct";
                  
                  // 답 가리기 ON이고 제출 후 정답/오답 표시
                  if (hideAnswers && isSubmitted) {
                    if (isCorrect(label)) className += " correct";
                    else if (isSelected(label) && !isCorrect(label)) className += " wrong";
                  }

                  return (
                    <div 
                      key={label} 
                      className={className}
                      onClick={() => handleOptionClick(opt)}
                    >
                      {opt}
                      {!hideAnswers && isCorrect(label) && <CheckCircle className="icon-feedback success" size={20} />}
                      {hideAnswers && isSubmitted && isCorrect(label) && <CheckCircle className="icon-feedback success" size={20} />}
                      {hideAnswers && isSubmitted && isSelected(label) && !isCorrect(label) && <XCircle className="icon-feedback error" size={20} />}
                    </div>
                  );
                })}
              </div>

              {!isSubmitted ? (
                <button 
                  onClick={handleSubmit} 
                  className="submit-btn"
                  disabled={selectedOptions.length === 0}
                >
                  정답 확인
                </button>
              ) : (
                <div className="feedback-section">
                  <div className="feedback-item">
                    <strong>💡 Vocabulary:</strong> {currentQuestion.vocabulary}
                  </div>
                  <div className="feedback-item">
                    <strong>🔑 Concept:</strong> {currentQuestion.concept}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 네비게이션 버튼 (다음) */}
        <button 
          onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
          disabled={currentIndex === questions.length - 1}
          className="nav-btn"
        >
          <ChevronRight size={32} />
        </button>
      </main>
    </div>
  );
}

export default App;
