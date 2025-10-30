document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("chatbot-toggle");
    const chatbotBox = document.getElementById("chatbot-box");
    const closeBtn = document.getElementById("close-chatbot");
    const messages = document.getElementById("chatbot-messages");
    const typingIndicator = document.getElementById("typing-indicator");

    //show typing indicator
    function showTyping() {
        typingIndicator.classList.remove("hidden");
        messages.appendChild(typingIndicator);
        messages.scrollTop = messages.scrollHeight;
    }

    //hide typing indicator
    function hideTyping() {
        typingIndicator.classList.add("hidden");
    }

    // Toggle chatbot visibility
    toggleBtn.addEventListener("click", () => {
        chatbotBox.classList.toggle("hidden");
        if (!chatbotBox.classList.contains("hidden")) {
            if (messages.innerHTML.trim() === "" || messages.innerHTML.includes("ReviewAI Assistant")) {
                loadCategorizedFAQs();
            }
        }
    });

    closeBtn.addEventListener("click", () => chatbotBox.classList.add("hidden"));

    // Load categorized FAQs
    async function loadCategorizedFAQs() {
        messages.innerHTML = `
            <div class='flex items-start gap-3 mb-4'>
                <div class='flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm'>
                    <span class='text-white text-sm font-semibold'>AI</span>
                </div>
                <div class='bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800 p-4 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] border border-blue-100'>
                    <p class='text-sm leading-relaxed'>
                        Hello! 👋 I'm <span class='font-semibold text-blue-600'>ReviewAI Assistant</span>. 
                        I'm here to help you navigate through our FAQs. Select a category below to get started:
                    </p>
                </div>
            </div>
        `;

        showTyping();

        try {
            const res = await fetch("/faq-list/");
            const data = await res.json();

            // Delay 
            await new Promise(r => setTimeout(r, 1000));
            hideTyping();

            // Category icons mapping
            const categoryIcons = {
                'general': '📋',
                'account': '👤',
                'reviews': '⭐',
                'analysis': '📊',
                'technical': '⚙️',
                'security': '🔒',
                'billing': '💳'
            };

            for (const [category, faqs] of Object.entries(data)) {
                const icon = categoryIcons[category.toLowerCase()] || '💡';
                const categoryName = category.replace(/_/g, " ");
                
                messages.innerHTML += `
                    <div class='flex items-start gap-3 mb-4'>
                        <div class='flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm'>
                            <span class='text-white text-sm font-semibold'>AI</span>
                        </div>
                        <div class='bg-white p-4 rounded-2xl rounded-tl-sm shadow-md max-w-[85%] border border-gray-100'>
                            <div class='flex items-center gap-2 mb-3 pb-2 border-b border-gray-200'>
                                <span class='text-xl'>${icon}</span>
                                <h3 class='text-sm font-bold text-gray-800 capitalize'>
                                    ${categoryName}
                                </h3>
                            </div>
                            <div class='flex flex-wrap gap-2'>
                                ${faqs.map(faq => `
                                    <button class='faq-btn group bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl px-3 py-2 text-xs font-medium hover:from-blue-100 hover:to-indigo-100 hover:shadow-md transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:scale-105'
                                        data-question="${faq.question}">
                                        <span class='flex items-center gap-1'>
                                            ${faq.question}
                                            <svg class='w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5l7 7-7 7'></path>
                                            </svg>
                                        </span>
                                    </button>
                                `).join("")}
                            </div>
                        </div>
                    </div>
                `;
            }

            // Add click events for FAQ buttons
            document.querySelectorAll(".faq-btn").forEach(btn => {
                btn.addEventListener("click", () => showAnswer(btn.dataset.question));
            });

            messages.scrollTop = messages.scrollHeight;

        } catch (err) {
            hideTyping();
            messages.innerHTML += `
                <div class='flex items-start gap-3 mb-4'>
                    <div class='flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm'>
                        <span class='text-white text-sm font-semibold'>!</span>
                    </div>
                    <div class='bg-red-50 text-red-700 p-4 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] border border-red-200'>
                        <p class='text-sm font-medium'>Oops! I couldn't load the FAQs right now. Please try again later.</p>
                    </div>
                </div>
            `;
        }
    }

    // Show FAQ Answer
    async function showAnswer(question) {
        // User question bubble
        messages.innerHTML += `
            <div class='flex items-start gap-3 mb-4 justify-end'>
                <div class='bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-2xl rounded-tr-sm shadow-md max-w-[85%]'>
                    <p class='text-sm leading-relaxed'>${question}</p>
                </div>
                <div class='flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-sm'>
                    <svg class='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                        <path fill-rule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clip-rule='evenodd'></path>
                    </svg>
                </div>
            </div>
        `;
        messages.scrollTop = messages.scrollHeight;

        showTyping();

        try {
            const res = await fetch("/chatbot/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: question }),
            });
            const data = await res.json();

            await new Promise(r => setTimeout(r, 800));
            hideTyping();

            // Bot answer bubble
            messages.innerHTML += `
                <div class='flex items-start gap-3 mb-4'>
                    <div class='flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm'>
                        <span class='text-white text-sm font-semibold'>AI</span>
                    </div>
                    <div class='bg-white text-gray-800 p-4 rounded-2xl rounded-tl-sm shadow-md max-w-[85%] border border-gray-200'>
                        <p class='text-sm leading-relaxed whitespace-pre-wrap'>${data.answer}</p>
                    </div>
                </div>
            `;

            if (data.suggestions && data.suggestions.length > 0) {
                messages.innerHTML += `
                    <div class='flex items-start gap-3 mb-4'>
                        <div class='flex-shrink-0 w-8 h-8'></div>
                        <div class='max-w-[85%]'>
                            <p class='text-xs text-gray-500 font-medium mb-2 ml-1'>Related questions:</p>
                            <div class='flex flex-wrap gap-2'>
                                ${data.suggestions.map(q => `
                                    <button class='faq-btn group bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl px-3 py-2 text-xs font-medium hover:from-purple-100 hover:to-pink-100 hover:shadow-md transition-all duration-200 border border-purple-200 hover:border-purple-300 hover:scale-105'
                                        data-question="${q}">
                                        <span class='flex items-center gap-1'>
                                            ${q}
                                            <svg class='w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5l7 7-7 7'></path>
                                            </svg>
                                        </span>
                                    </button>
                                `).join("")}
                            </div>
                        </div>
                    </div>
                `;
                
                document.querySelectorAll(".faq-btn").forEach(btn => {
                    btn.addEventListener("click", () => showAnswer(btn.dataset.question));
                });
            }

            messages.scrollTop = messages.scrollHeight;

        } catch (err) {
            hideTyping();
            messages.innerHTML += `
                <div class='flex items-start gap-3 mb-4'>
                    <div class='flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm'>
                        <span class='text-white text-sm font-semibold'>!</span>
                    </div>
                    <div class='bg-red-50 text-red-700 p-4 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] border border-red-200'>
                        <p class='text-sm font-medium'>Could not fetch that answer right now. Please try again.</p>
                    </div>
                </div>
            `;
        }
    }
});