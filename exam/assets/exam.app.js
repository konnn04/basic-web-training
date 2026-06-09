let examData = null;
let examId = '';
let currentIndex = 0;
let userAnswers = {};
let timeLeft = 0;
let totalTime = 0;
let timerInterval = null;
let quizSubmitted = false;
let seed = '';
let originalOrder = [];

// Simple seeded PRNG (mulberry32)
function seededRandom(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h) + s.charCodeAt(i);
    }
    let state = h >>> 0;
    return function () {
        state |= 0;
        state = state + 0x6D2B79F5 | 0;
        let t = Math.imul(state ^ state >>> 15, 1 | state);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// Fisher-Yates shuffle với seeded random
function shuffleWithSeed(arr, seedStr) {
    const rand = seededRandom(seedStr);
    const result = arr.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

function loadQuiz() {
    examId = getParam('id');
    if (!examId) {
        showError('Thiếu mã bài kiểm tra. Vui lòng chọn bài từ trang chủ.');
        return;
    }

    $.ajax({
        url: 'data/' + examId + '.json',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            examData = data;
            if (data.random === true) {
                seed = data._seed || (Date.now().toString(36) + Math.random().toString(36).substr(2, 8));
                // Lưu thứ tự gốc để mapping kết quả
                originalOrder = examData.questions.map(function (_, i) { return i; });
                // Shuffle câu hỏi bằng seed
                examData.questions = shuffleWithSeed(examData.questions, seed);
            }
            startQuiz();
        },
        error: function () {
            showError('Không tìm thấy bài kiểm tra "' + escapeHtml(examId) + '".');
        }
    });
}

function showError(msg) {
    $('#quizLoading').addClass('d-none');
    $('#quizError').removeClass('d-none');
    $('#quizErrorMsg').text(msg);
}

function startQuiz() {
    $('#quizLoading').addClass('d-none');
    $('#quizActive').removeClass('d-none');

    for (let i = 0; i < examData.questions.length; i++) {
        userAnswers[i] = -1;
    }

    totalTime = (examData.duration || 10) * 60;
    timeLeft = totalTime;
    updateTimerDisplay();
    timerInterval = setInterval(tick, 1000);

    renderNavPills();
    showQuestion(0);
    updateProgress();
}

function tick() {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        submitQuiz();
    }
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    $('#timerDisplay').text(
        String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
    );

    const pct = (timeLeft / totalTime) * 100;
    $('#timerBarFill').css('width', pct + '%');

    if (timeLeft < totalTime * 0.3) {
        $('#timerDisplay').addClass('warning');
        $('#timerBarFill').addClass('warning');
    } else {
        $('#timerDisplay').removeClass('warning');
        $('#timerBarFill').removeClass('warning');
    }
}

function renderNavPills() {
    let html = '';
    for (let i = 0; i < examData.questions.length; i++) {
        html += '<div class="question-nav-pill" onclick="goToQuestion(' + i + ')" id="navPill' + i + '">' + (i + 1) + '</div>';
    }
    $('#questionNavPills').html(html);
}

function goToQuestion(index) {
    showQuestion(index);
}

function prevQuestion() {
    if (currentIndex > 0) {
        showQuestion(currentIndex - 1);
    }
}

function nextQuestion() {
    if (currentIndex < examData.questions.length - 1) {
        showQuestion(currentIndex + 1);
    }
}

function showQuestion(index) {
    currentIndex = index;
    const q = examData.questions[index];
    const qContent = (typeof q.question === 'object') ? q.question.content : q.question;
    const qImages = (typeof q.question === 'object' && q.question.images) ? q.question.images : [];

    $('#questionNum').text(index + 1);
    $('#questionText').text(qContent);
    $('#progressLabel').text('Câu ' + (index + 1) + ' / ' + examData.questions.length);

    // Render question images
    let imgHtml = '';
    for (let i = 0; i < qImages.length; i++) {
        imgHtml += '<div class="question-image-wrap">';
        imgHtml += '<img src="' + escapeHtml(qImages[i]) + '" alt="Hình câu hỏi" class="question-image" onclick="zoomImage(this)" loading="lazy">';
        imgHtml += '<div class="image-zoom-hint"><i class="bi bi-zoom-in"></i> Nhấn để phóng to</div>';
        imgHtml += '</div>';
    }
    $('#questionImages').html(imgHtml).toggle(qImages.length > 0);

    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    let html = '';
    const qType = q.type || 'multiple_choice';

    if (qType === 'short_answer') {
        const val = userAnswers[index] !== -1 ? escapeHtml(userAnswers[index]) : '';
        html += '<div class="mb-2">';
        html += '<textarea class="form-control" id="shortAnswerInput" rows="3" placeholder="Nhập câu trả lời của bạn..." oninput="onShortAnswerChange(' + index + ', this.value)">' + val + '</textarea>';
        html += '</div>';
    } else {
        const options = q.options || [];
        for (let i = 0; i < options.length; i++) {
            const optContent = (typeof options[i] === 'object') ? options[i].content : options[i];
            const selectedClass = userAnswers[index] === i ? ' selected' : '';
            html += '<div class="answer-option' + selectedClass + '" onclick="selectAnswer(' + index + ', ' + i + ')" id="answerOpt' + i + '">';
            html += '<div class="answer-radio"></div>';
            html += '<span class="answer-label">' + labels[i] + '</span>';
            html += '<span class="answer-text">' + escapeHtml(optContent) + '</span>';
            html += '</div>';
        }
    }
    $('#answerList').html(html);

    $('.question-nav-pill').removeClass('active');
    $('#navPill' + index).addClass('active');

    $('#btnPrev').prop('disabled', index === 0);
    $('#btnNext').prop('disabled', index === examData.questions.length - 1);

    document.getElementById('questionCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectAnswer(qIndex, aIndex) {
    if (quizSubmitted) return;
    userAnswers[qIndex] = aIndex;

    $('#answerList .answer-option').removeClass('selected');
    $('#answerOpt' + aIndex).addClass('selected');
    $('#navPill' + qIndex).addClass('answered');

    updateProgress();
}

function onShortAnswerChange(qIndex, value) {
    if (quizSubmitted) return;
    userAnswers[qIndex] = value.trim();
    if (value.trim() !== '') {
        $('#navPill' + qIndex).addClass('answered');
    } else {
        userAnswers[qIndex] = -1;
        $('#navPill' + qIndex).removeClass('answered');
    }
    updateProgress();
}

function updateProgress() {
    let answered = 0;
    for (let i = 0; i < examData.questions.length; i++) {
        if (userAnswers[i] !== -1 && userAnswers[i] !== '') answered++;
    }
    const pct = (answered / examData.questions.length) * 100;
    $('#progressBar').css('width', pct + '%');
    $('#answeredLabel').text('Đã TL: ' + answered + '/' + examData.questions.length);
}

function submitQuiz() {
    if (quizSubmitted) return;

    let unanswered = 0;
    for (let i = 0; i < examData.questions.length; i++) {
        if (userAnswers[i] === -1 || userAnswers[i] === '') unanswered++;
    }

    let msg = 'Bạn có chắc muốn nộp bài?';
    if (unanswered > 0) {
        msg = 'Bạn còn ' + unanswered + ' câu chưa trả lời. Nộp bài ngay?';
    }
    if (!confirm(msg)) return;

    quizSubmitted = true;
    clearInterval(timerInterval);

    let correctCount = 0;
    const total = examData.questions.length;
    const details = [];

    for (let i = 0; i < total; i++) {
        const q = examData.questions[i];
        const qType = q.type || 'multiple_choice';
        let isCorrect = false;

        if (qType === 'short_answer') {
            const userAns = (userAnswers[i] || '').toString().toLowerCase().trim();
            const correctAnswers = (q.answer || []).map(function (a) { return a.toString().toLowerCase().trim(); });
            isCorrect = correctAnswers.indexOf(userAns) >= 0;
        } else {
            const optIndex = userAnswers[i];
            if (optIndex >= 0 && q.options && q.options[optIndex]) {
                const chosenId = q.options[optIndex].id;
                isCorrect = (q.answer || []).indexOf(chosenId) >= 0;
            }
        }

        if (isCorrect) correctCount++;

        details.push({
            index: i,
            userAnswer: userAnswers[i],
            correct: isCorrect,
            correctAnswer: q.answer || [],
            explanation: q.explanation || ''
        });
    }

    const score = Math.round((correctCount / total) * 100);

    const shareData = {
        examId: examId,
        userName: localStorage.getItem(STORAGE_KEY) || 'Học Sinh',
        seed: seed,
        userAnswers: userAnswers
    };
    const resultId = generateResultId();

    cleanLocalStorage();
    saveResult({
        resultId: resultId,
        userName: shareData.userName,
        examId: examId,
        score: score,
        correctCount: correctCount,
        total: total,
        date: new Date().toISOString(),
        timeUsed: totalTime - timeLeft,
        duration: examData.duration || 10,
        seed: seed,
        userAnswers: userAnswers
    });

    saveScoreHistory(score, correctCount, total, resultId);

    const encoded = encodeResultData(shareData);
    window.location.href = 'result.html?id=' + resultId + '&d=' + encoded;
}

function encodeResultData(obj) {
    const json = JSON.stringify(obj);
    let b64 = btoa(unescape(encodeURIComponent(json)));
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return b64;
}

function decodeResultData(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const json = decodeURIComponent(escape(atob(str)));
    return JSON.parse(json);
}

function generateResultId() {
    return 'r_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 8);
}

// Zoom ảnh: click để phóng to, click lần nữa thu nhỏ
function zoomImage(img) {
    if (img.classList.contains('zoomed')) {
        img.classList.remove('zoomed');
    } else {
        // Đóng tất cả ảnh zoom khác trước
        document.querySelectorAll('.question-image.zoomed').forEach(function (el) {
            el.classList.remove('zoomed');
        });
        img.classList.add('zoomed');
    }
}

// Đóng zoom khi click ra ngoài ảnh
$(document).on('click', function (e) {
    if (!$(e.target).hasClass('question-image')) {
        document.querySelectorAll('.question-image.zoomed').forEach(function (el) {
            el.classList.remove('zoomed');
        });
    }
});

function saveResult(data) {
    localStorage.setItem('exam_result_' + data.resultId, JSON.stringify(data));
}

function saveScoreHistory(score, correctCount, total, resultId) {
    const user = localStorage.getItem(STORAGE_KEY) || 'Unknown';
    const allScores = JSON.parse(localStorage.getItem('exam_scores_' + user) || '{}');
    const now = new Date();
    const dateStr = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear() +
        ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    allScores[examId] = {
        title: examData.title || examId,
        score: score,
        correct: correctCount,
        total: total,
        date: dateStr,
        resultId: resultId
    };

    localStorage.setItem('exam_scores_' + user, JSON.stringify(allScores));
}

$(document).ready(function () {
    loadQuiz();
});