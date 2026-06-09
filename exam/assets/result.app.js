
function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

// Simple seeded PRNG (mulberry32) - must match exam.app.js
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

// Fisher-Yates shuffle với seeded random - must match exam.app.js
function shuffleWithSeed(arr, seedStr) {
    const rand = seededRandom(seedStr);
    const result = arr.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function loadResult() {
    const resultId = getParam('id');
    const encodedData = getParam('d');

    if (!resultId && !encodedData) {
        showError('Thiếu mã kết quả.');
        return;
    }

    let data = null;

    if (encodedData) {
        try {
            data = decodeResultData(encodedData);
        } catch (e) {
            showError('Dữ liệu kết quả trong link bị lỗi.');
            return;
        }
    }

    if (!data && resultId) {
        const raw = localStorage.getItem('exam_result_' + resultId);
        if (raw) {
            try { data = JSON.parse(raw); } catch (e) { }
        }
    }

    if (!data) {
        showError('Không tìm thấy kết quả. Có thể kết quả đã bị xóa hoặc đường dẫn không đúng.');
        return;
    }

    $.ajax({
        url: 'data/' + data.examId + '.json',
        method: 'GET',
        dataType: 'json',
        success: function (examData) {
            $('#resultLoading').addClass('d-none');
            renderResult(data, examData);
        },
        error: function () {
            $('#resultLoading').addClass('d-none');
            renderResult(data, null);
        }
    });
}

function decodeResultData(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const json = decodeURIComponent(escape(atob(str)));
    return JSON.parse(json);
}

function showError(msg) {
    $('#resultLoading').addClass('d-none');
    $('#resultError').removeClass('d-none');
    $('#resultErrorMsg').text(msg);
}

function renderResult(data, examData) {
    let correctCount = data.correctCount || 0;
    let total = data.total || 0;
    let score = data.score || 0;

    // Nếu bài thi có random và có seed, shuffle lại câu hỏi theo seed để map đúng userAnswers
    if (examData && examData.questions && examData.random === true && data.seed) {
        examData.questions = shuffleWithSeed(examData.questions, data.seed);
    }

    if (examData && examData.questions) {
        total = examData.questions.length;
        correctCount = 0;
        for (let i = 0; i < total; i++) {
            const q = examData.questions[i];
            const qType = q.type || 'multiple_choice';
            const ua = (data.userAnswers && data.userAnswers[i] !== undefined) ? data.userAnswers[i] : -1;
            let isCorrect = false;
            if (qType === 'short_answer') {
                const ans = (ua || '').toString().toLowerCase().trim();
                const ca = (q.answer || []).map(function (a) { return a.toString().toLowerCase().trim(); });
                isCorrect = ca.indexOf(ans) >= 0;
            } else {
                if (ua >= 0 && q.options && q.options[ua]) {
                    isCorrect = (q.answer || []).indexOf(q.options[ua].id) >= 0;
                }
            }
            if (isCorrect) correctCount++;
        }
        score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    }

    const passed = score >= 70;
    const topClass = passed ? 'passed' : 'failed';
    const iconEmoji = passed ? 'bi-emoji-laughing' : 'bi-emoji-frown';
    const now = new Date();
    const dateStr = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear() +
        ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const examTitle = examData ? (examData.title || data.examId) : data.examId;

    let html = '';

    html += '<div class="result-header-card">';
    html += '<div class="result-top ' + topClass + '">';
    html += '<div class="result-avatar"><i class="bi ' + iconEmoji + '"></i></div>';
    html += '<div class="result-user-name">' + escapeHtml(data.userName) + '</div>';
    html += '<div class="result-exam-title">' + escapeHtml(examTitle) + '</div>';
    html += '<div class="result-big-score">' + score + '</div>';
    html += '<div class="result-score-label">điểm</div>';
    html += '</div>';

    html += '<div class="result-body">';
    html += '<div class="result-stat-row">';
    html += '<div class="result-stat"><div class="result-stat-value green">' + correctCount + '</div><div class="result-stat-label">Đúng</div></div>';
    html += '<div class="result-stat"><div class="result-stat-value red">' + (total - correctCount) + '</div><div class="result-stat-label">Sai / Bỏ qua</div></div>';
    html += '<div class="result-stat"><div class="result-stat-value">' + total + '</div><div class="result-stat-label">Tổng câu</div></div>';
    if (data.timeUsed !== undefined) {
        const tuMin = Math.floor(data.timeUsed / 60);
        const tuSec = data.timeUsed % 60;
        html += '<div class="result-stat"><div class="result-stat-value orange">' + tuMin + ':' + String(tuSec).padStart(2, '0') + '</div><div class="result-stat-label">Thời gian</div></div>';
    }
    html += '</div>';

    html += '<div class="text-muted text-center small">Ngày làm: ' + dateStr + '</div>';

    html += '<div class="result-divider"></div>';

    html += '<div class="qr-section">';
    html += '<div class="qr-title"><i class="bi bi-qr-code"></i> Quét mã QR để xem kết quả</div>';
    html += '<div class="qr-container"><img id="qrCodeImg" src="" alt="QR Code" style="width:180px;height:180px;"></div>';
    html += '<div class="qr-hint">Dùng camera hoặc ứng dụng quét mã để xem kết quả này</div>';
    html += '</div>';

    html += '<div class="btn-group-bottom">';
    html += '<a href="index.html" class="btn btn-orange"><i class="bi bi-house"></i> Trang chủ</a>';
    html += '<a href="exam.html?id=' + data.examId + '" class="btn btn-outline-orange"><i class="bi bi-arrow-repeat"></i> Làm lại</a>';
    html += '</div>';

    html += '</div></div>';

    if (examData && examData.questions && data.userAnswers) {
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        html += '<h5 class="section-title mt-4"><i class="bi bi-list-ul"></i> Chi tiết bài làm</h5>';

        for (let i = 0; i < examData.questions.length; i++) {
            const q = examData.questions[i];
            const qType = q.type || 'multiple_choice';
            const qContent = (typeof q.question === 'object') ? q.question.content : q.question;
            const userAns = data.userAnswers[i];

            let isCorrect = false;
            if (qType === 'short_answer') {
                const ua = (userAns || '').toString().toLowerCase().trim();
                const ca = (q.answer || []).map(function (a) { return a.toString().toLowerCase().trim(); });
                isCorrect = ca.indexOf(ua) >= 0;
            } else {
                const optIndex = userAns;
                if (optIndex >= 0 && q.options && q.options[optIndex]) {
                    isCorrect = (q.answer || []).indexOf(q.options[optIndex].id) >= 0;
                }
            }

            const headerClass = isCorrect ? 'correct' : 'wrong';
            const numClass = isCorrect ? 'correct' : 'wrong';
            const statusIcon = isCorrect ? '<i class="bi bi-check-circle-fill text-success"></i>' : '<i class="bi bi-x-circle-fill text-danger"></i>';

            html += '<div class="review-card">';
            html += '<div class="review-card-header ' + headerClass + '">';
            html += '<div class="review-num ' + numClass + '">' + (i + 1) + '</div>';
            html += '<div class="flex-grow-1 fw-semibold">' + escapeHtml(qContent) + '</div>';
            html += statusIcon;
            html += '</div>';
            html += '<div class="review-card-body">';

            // Render question images in review
            const qImages = (typeof q.question === 'object' && q.question.images) ? q.question.images : [];
            if (qImages.length > 0) {
                html += '<div class="review-images">';
                for (let k = 0; k < qImages.length; k++) {
                    html += '<img src="' + escapeHtml(qImages[k]) + '" alt="Hình câu hỏi" class="review-image" onclick="zoomImage(this)" loading="lazy">';
                }
                html += '</div>';
            }

            if (qType === 'short_answer') {
                const ua = userAns !== -1 && userAns !== '' ? userAns : '(chưa trả lời)';
                html += '<div><span class="text-muted">Bạn trả lời:</span> <span class="review-answer your-answer">' + escapeHtml(ua) + '</span></div>';
                if (!isCorrect) {
                    html += '<div class="mt-1"><span class="text-muted">Đáp án đúng:</span> <span class="review-answer correct-answer">' + escapeHtml((q.answer || []).join(', ')) + '</span></div>';
                }
            } else {
                const optIndex = userAns;
                if (optIndex >= 0 && q.options && q.options[optIndex]) {
                    const chosen = (typeof q.options[optIndex] === 'object') ? q.options[optIndex].content : q.options[optIndex];
                    html += '<div><span class="text-muted">Bạn chọn:</span> <span class="review-answer your-answer">' + labels[optIndex] + '. ' + escapeHtml(chosen) + '</span></div>';
                } else {
                    html += '<div><span class="text-muted">Bạn chọn:</span> <span class="text-muted fst-italic">(chưa trả lời)</span></div>';
                }
                if (!isCorrect) {
                    const correctOptions = [];
                    for (let j = 0; j < (q.options || []).length; j++) {
                        if ((q.answer || []).indexOf(q.options[j].id) >= 0) {
                            correctOptions.push(labels[j] + '. ' + escapeHtml(q.options[j].content));
                        }
                    }
                    html += '<div class="mt-1"><span class="text-muted">Đáp án đúng:</span> <span class="review-answer correct-answer">' + correctOptions.join(', ') + '</span></div>';
                }
            }

            if (q.explanation) {
                html += '<div class="mt-2 text-muted small"><i class="bi bi-info-circle"></i> ' + escapeHtml(q.explanation) + '</div>';
            }

            html += '</div></div>';
        }
    }

    $('#resultData').html(html).removeClass('d-none');

    setTimeout(function () {
        const baseUrl = window.location.href.split('?')[0];
        const dParam = getParam('d');
        let qrDataUrl;
        if (dParam) {
            qrDataUrl = baseUrl + '?id=' + (data.resultId || '') + '&d=' + dParam;
        } else {
            const slim = { examId: data.examId, userName: data.userName, seed: data.seed || '', userAnswers: data.userAnswers };
            let enc = btoa(unescape(encodeURIComponent(JSON.stringify(slim))));
            enc = enc.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            qrDataUrl = baseUrl + '?id=' + (data.resultId || '') + '&d=' + enc;
        }
        const img = document.getElementById('qrCodeImg');
        if (img) {
            img.src = 'https://quickchart.io/qr?text=' + encodeURIComponent(qrDataUrl) + '&size=200&dark=f57c00';
            img.onerror = function () {
                img.src = 'https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=' + encodeURIComponent(qrDataUrl) + '&choe=UTF-8';
                img.onerror = function () {
                    img.parentElement.innerHTML = '<div class="text-center text-muted small p-3">QR không tạo được.<br><small>Hãy copy link trình duyệt để share.</small></div>';
                };
            };
        }
    }, 100);
}
$(document).ready(function () {
    loadResult();
});

// Zoom ảnh: click để phóng to, click lần nữa thu nhỏ
function zoomImage(img) {
    if (img.classList.contains('zoomed')) {
        img.classList.remove('zoomed');
    } else {
        document.querySelectorAll('.review-image.zoomed, .question-image.zoomed').forEach(function (el) {
            el.classList.remove('zoomed');
        });
        img.classList.add('zoomed');
    }
}

// Đóng zoom khi click ra ngoài ảnh
$(document).on('click', function (e) {
    if (!$(e.target).hasClass('review-image') && !$(e.target).hasClass('question-image')) {
        document.querySelectorAll('.review-image.zoomed, .question-image.zoomed').forEach(function (el) {
            el.classList.remove('zoomed');
        });
    }
});