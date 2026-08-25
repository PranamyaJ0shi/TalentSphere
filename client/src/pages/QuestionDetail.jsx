import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBookmark,
  FiClock,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiArrowLeft,
  FiArrowRight,
  FiChevronLeft,
  FiSave,
  FiSend,
  FiAlertCircle,
  FiAward,
  FiInfo,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';

const QuestionDetail = () => {
  const { role, id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [questionsInRole, setQuestionsInRole] = useState([]);
  const [loading, setLoading] = useState(true);

  // Answer editor state
  const [answer, setAnswer] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // 'saving', 'saved', ''

  // Timer state
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

  // Submission / AI Evaluation state
  const [submitting, setSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null); // { score, feedback }
  const [showEvalModal, setShowEvalModal] = useState(false);

  // References
  const timerRef = useRef(null);

  // 1. Fetch Question details
  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      setEvalResult(null);
      setShowEvalModal(false);
      try {
        const res = await API.get(`/questions/${id}`);
        if (res.data.success) {
          setQuestion(res.data.data);
          setIsBookmarked(res.data.data.isBookmarked);

          // Restore draft from local storage if available
          const draftKey = `draft_ans_${id}`;
          const savedDraft = localStorage.getItem(draftKey);
          if (savedDraft) {
            setAnswer(savedDraft);
          } else if (res.data.data.previousSubmission) {
            setAnswer(res.data.data.previousSubmission.answer);
          } else {
            setAnswer('');
          }

          // Fetch all questions to resolve Next/Previous navigation
          const listRes = await API.get('/questions');
          if (listRes.data.success) {
            const sameRoleQuestions = listRes.data.data.filter(
              (q) => q.role.toLowerCase().replace(/\s+/g, '-') === role
            );
            setQuestionsInRole(sameRoleQuestions);
          }
        }
      } catch (err) {
        console.error('Error loading question:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
    setTime(0);
    setTimerRunning(true);
  }, [id, role]);

  // 2. Play / Pause Count-up Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // 3. Auto-save Answer Draft every 30 seconds
  useEffect(() => {
    if (loading || !question) return;

    const autoSaveInterval = setInterval(() => {
      if (answer.trim().length > 0) {
        setAutoSaveStatus('saving');
        localStorage.setItem(`draft_ans_${id}`, answer);
        setTimeout(() => {
          setAutoSaveStatus('saved');
          setLastAutoSaved(new Date().toLocaleTimeString());
          // Status fade out
          setTimeout(() => setAutoSaveStatus(''), 2000);
        }, 800);
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [answer, id, loading, question]);

  // Manual save trigger
  const handleManualSave = () => {
    setAutoSaveStatus('saving');
    localStorage.setItem(`draft_ans_${id}`, answer);
    setTimeout(() => {
      setAutoSaveStatus('saved');
      setLastAutoSaved(new Date().toLocaleTimeString());
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 500);
  };

  // 4. Toggle Bookmark state
  const handleToggleBookmark = async () => {
    try {
      const res = await API.post('/bookmarks', { questionId: id });
      if (res.data.success) {
        setIsBookmarked(res.data.isBookmarked);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  // 5. Submit Answer for AI evaluation
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    setSubmitting(true);
    setTimerRunning(false); // Pause timer during submission
    try {
      const res = await API.post('/answers', {
        questionId: id,
        answer: answer.trim(),
      });

      if (res.data.success) {
        setEvalResult(res.data.data);
        setShowEvalModal(true);
        // Clear local storage draft upon successful database log
        localStorage.removeItem(`draft_ans_${id}`);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Next/Previous indexes
  const currentIndex = questionsInRole.findIndex((q) => q._id === id);
  const prevQuestion = currentIndex > 0 ? questionsInRole[currentIndex - 1] : null;
  const nextQuestion = currentIndex < questionsInRole.length - 1 ? questionsInRole[currentIndex + 1] : null;

  // Format timer values
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Counting characters and words
  const charCount = answer.length;
  const wordCount = answer.trim() === '' ? 0 : answer.trim().split(/\s+/).length;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center h-10 bg-slate-200 rounded-xl shimmer"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[500px] bg-slate-200 rounded-3xl shimmer border border-slate-200"></div>
          <div className="h-[500px] bg-slate-200 rounded-3xl shimmer border border-slate-200"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="glass-panel rounded-3xl py-14 text-center">
        <FiAlertCircle className="w-12 h-12 mx-auto text-rose-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">Question not found</h3>
        <p className="text-slate-500 mt-1 mb-6 text-sm">The question requested does not exist or has been deleted.</p>
        <Link to="/categories" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white">
          Back to categories
        </Link>
      </div>
    );
  }

  const diffStyles = {
    Easy: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Hard: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Top back & navigation bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
        <Link
          to="/categories"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors font-bold"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to List
        </Link>

        {/* Question Index Navigator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold mr-2">
            Question {currentIndex + 1} of {questionsInRole.length}
          </span>
          <button
            disabled={!prevQuestion}
            onClick={() => navigate(`/categories/${role}/${prevQuestion._id}`)}
            className="p-2 bg-white border border-slate-300 disabled:opacity-30 rounded-xl hover:border-blue-300 text-slate-800 disabled:pointer-events-none transition-colors"
            title="Previous Question"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={!nextQuestion}
            onClick={() => navigate(`/categories/${role}/${nextQuestion._id}`)}
            className="p-2 bg-white border border-slate-300 disabled:opacity-30 rounded-xl hover:border-blue-300 text-slate-800 disabled:pointer-events-none transition-colors"
            title="Next Question"
          >
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Question details */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6.5 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                {question.role}
              </span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${diffStyles[question.difficulty]}`}>
                {question.difficulty}
              </span>
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <FiClock className="w-4 h-4" /> {question.estimatedTime} mins limit
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-slate-800 leading-snug">{question.title}</h2>

            {/* Divider */}
            <div className="h-px bg-slate-200" />

            {/* Description Body */}
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
              {question.description}
            </div>

            {/* Tags list */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {question.tags.map((tag) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Reference Info Warning */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-600 flex gap-2.5 items-start">
            <FiInfo className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-slate-800 mb-0.5">AI Practice Guidelines</h5>
              <p className="leading-relaxed">
                Provide a complete structural explanation. Outline definitions, advantages, and real-world examples. AI scores are based on conceptual keyword coverage.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Answer editor */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Editor Top Bar (Timer and Actions) */}
            <div className="flex justify-between items-center flex-wrap gap-3 pb-3 border-b border-slate-200">
              {/* Count-up Timer */}
              <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-xl border border-slate-300">
                <FiClock className={`w-4 h-4 ${timerRunning ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
                <span className="font-mono text-sm text-slate-700 tracking-wider">{formatTime(time)}</span>
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="p-1 hover:text-slate-800 text-slate-400 transition-colors"
                  title={timerRunning ? 'Pause Timer' : 'Resume Timer'}
                >
                  {timerRunning ? <FiPause className="w-3.5 h-3.5" /> : <FiPlay className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setTime(0)}
                  className="p-1 hover:text-slate-800 text-slate-400 transition-colors"
                  title="Reset Timer"
                >
                  <FiRotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Save / Bookmark Actions */}
              <div className="flex items-center gap-2">
                {/* Auto-save status text */}
                <span className="text-xs text-slate-500 italic mr-2">
                  {autoSaveStatus === 'saving' && 'Auto-saving...'}
                  {autoSaveStatus === 'saved' && `Saved local draft`}
                  {!autoSaveStatus && lastAutoSaved && `Last saved ${lastAutoSaved}`}
                </span>

                <button
                  onClick={handleManualSave}
                  className="p-2.5 bg-white border border-slate-300 hover:border-blue-300 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
                  title="Save Draft Locally"
                >
                  <FiSave className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleBookmark}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isBookmarked
                      ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-600'
                      : 'bg-white border-slate-300 text-slate-500 hover:text-slate-800 hover:border-blue-300'
                  }`}
                  title="Bookmark Question"
                >
                  <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Text Editor Area */}
            <div className="relative">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your detailed explanation here..."
                disabled={submitting}
                className="w-full h-80 bg-white border border-slate-300 rounded-2xl p-4.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono resize-none focus:bg-white"
              />
            </div>

            {/* Counters bar */}
            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold px-1">
              <span>
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
              <span>
                {charCount} {charCount === 1 ? 'character' : 'characters'}
              </span>
            </div>
          </div>

          {/* Submission and navigation buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setAnswer('');
                localStorage.removeItem(`draft_ans_${id}`);
              }}
              disabled={submitting || !answer}
              className="px-4 py-2.5 text-xs text-slate-500 hover:text-rose-400 font-bold hover:bg-rose-50 rounded-xl transition-all"
            >
              Clear Draft
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={submitting || !answer.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/15 transition-all"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <FiSend className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Evaluation report Overlay (Slide out Modal) */}
      <AnimatePresence>
        {showEvalModal && evalResult && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-end p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEvalModal(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="h-full sm:h-[95vh] w-full sm:max-w-xl bg-white border-l border-slate-200 p-6 sm:p-8 overflow-y-auto shadow-2xl relative sm:rounded-3xl z-10"
            >
              <button
                onClick={() => setShowEvalModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="space-y-6 pt-4">
                {/* Header title */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-md">
                    <FiAward className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">AI Evaluation Report</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Automated technical performance review.</p>
                  </div>
                </div>

                {/* Score gauge and completeness badge */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl grid grid-cols-2 gap-4 text-center">
                  <div className="border-r border-slate-200 py-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">Evaluation Score</span>
                    <span className="text-3xl font-black text-slate-800 mt-1 block">{evalResult.score}/100</span>
                  </div>
                  <div className="py-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">Performance Grade</span>
                    <span
                      className={`text-base font-extrabold mt-2.5 inline-block px-3 py-1 rounded-lg ${
                        evalResult.score >= 85
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                          : evalResult.score >= 50
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                      }`}
                    >
                      {evalResult.score >= 85 ? 'Excellent' : evalResult.score >= 50 ? 'Satisfactory' : 'Needs Work'}
                    </span>
                  </div>
                </div>

                {/* Feedback markdown block */}
                <div className="prose max-w-none text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
                  {/* Since evaluator output is formatted in markdown, we can safely split and render headers/lists visually */}
                  {evalResult.feedback.split('\n\n').map((block, i) => {
                    if (block.startsWith('### ')) {
                      return <h4 key={i} className="text-base font-extrabold text-slate-700 mt-4 border-b border-slate-200 pb-2">{block.replace('### ', '')}</h4>;
                    }
                    if (block.startsWith('#### ')) {
                      return <h5 key={i} className="text-sm font-bold text-slate-600 mt-3">{block.replace('#### ', '')}</h5>;
                    }
                    if (block.includes(' - [')) {
                      return (
                        <ul key={i} className="space-y-1.5 my-2 pl-1.5">
                          {block.split('\n').map((line, j) => {
                            const isChecked = line.includes('[x]');
                            const lineText = line.replace(/ - \[[x\s]\]\s*/g, '');
                            return (
                              <li key={j} className="flex items-center gap-2 text-xs">
                                <span className={isChecked ? 'text-blue-600' : 'text-slate-400'}>
                                  {isChecked ? <FiCheckCircle className="w-4 h-4 shrink-0" /> : <FiAlertCircle className="w-4 h-4 shrink-0" />}
                                </span>
                                <span className={isChecked ? 'text-slate-700' : 'text-slate-500 line-through decoration-slate-300'}>{lineText}</span>
                              </li>
                            );
                          })}
                        </ul>
                      );
                    }
                    return <p key={i} className="leading-relaxed whitespace-pre-line text-slate-600">{block}</p>;
                  })}
                </div>

                {/* Reference Solution Expansion */}
                <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl space-y-2">
                  <h4 className="text-sm font-bold text-blue-600">Reference Answer Key</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {question.expectedAnswer}
                  </p>
                </div>

                {/* Footer close button */}
                <button
                  onClick={() => setShowEvalModal(false)}
                  className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-semibold tracking-wider transition-colors uppercase shadow-sm"
                >
                  Continue Practicing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionDetail;
