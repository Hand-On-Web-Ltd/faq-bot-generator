const faqInput = document.getElementById('faqInput');
const faqList = document.getElementById('faqList');
const faqStatus = document.getElementById('faqStatus');
const messages = document.getElementById('messages');
const questionInput = document.getElementById('questionInput');

questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') askQuestion();
});

async function loadSample() {
    try {
        const res = await fetch('/sample-faq.json');
        const data = await res.json();
        faqInput.value = JSON.stringify(data, null, 2);
    } catch (err) {
        faqStatus.textContent = 'Could not load sample file.';
        faqStatus.style.color = '#f85149';
    }
}

async function uploadFaqs() {
    let faqs;
    try {
        faqs = JSON.parse(faqInput.value);
    } catch (e) {
        faqStatus.textContent = 'Invalid JSON. Check the format and try again.';
        faqStatus.style.color = '#f85149';
        return;
    }

    faqStatus.textContent = 'Processing...';
    faqStatus.style.color = '#8b949e';

    try {
        const res = await fetch('/api/faqs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ faqs })
        });
        const data = await res.json();

        if (data.error) {
            faqStatus.textContent = data.error;
            faqStatus.style.color = '#f85149';
            return;
        }

        faqStatus.textContent = data.message;
        faqStatus.style.color = '#3fb950';

        // Show FAQ list
        faqList.innerHTML = '';
        faqs.forEach(faq => {
            const div = document.createElement('div');
            div.className = 'faq-item';
            div.innerHTML = `<strong>Q: ${faq.question}</strong><p>${faq.answer}</p>`;
            faqList.appendChild(div);
        });

        addMessage('bot', `Loaded ${faqs.length} FAQs. Go ahead and ask me something!`);
    } catch (err) {
        faqStatus.textContent = 'Upload failed. Is the server running?';
        faqStatus.style.color = '#f85149';
    }
}

function addMessage(role, text, confidence) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = text;
    if (confidence !== undefined) {
        const conf = document.createElement('div');
        conf.className = 'confidence';
        conf.textContent = `${confidence}% match`;
        div.appendChild(conf);
    }
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

async function askQuestion() {
    const text = questionInput.value.trim();
    if (!text) return;

    addMessage('user', text);
    questionInput.value = '';

    try {
        const res = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: text })
        });
        const data = await res.json();

        if (data.error) {
            addMessage('bot', data.error);
        } else {
            addMessage('bot', data.answer, data.confidence);
        }
    } catch (err) {
        addMessage('bot', 'Connection error. Is the server running?');
    }
}
