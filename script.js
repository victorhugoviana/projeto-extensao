document.addEventListener('DOMContentLoaded', () => {
    
    // ====================================================================
    // 1. GESTÃO DO CARRINHO (COM LOCALSTORAGE)
    // ====================================================================

    const cartPanel = document.getElementById('cart-panel');
    const cartIconBtn = document.getElementById('cart-icon-btn');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartCountDisplay = document.querySelector('.cart-count');
    const overlay = document.getElementById('overlay');
    const checkoutBtn = document.querySelector('.btn-checkout');

    // Recupera carrinho salvo
    let cart = JSON.parse(localStorage.getItem('gameScoreCart')) || [];

    // Função para salvar
    const saveCart = () => {
        localStorage.setItem('gameScoreCart', JSON.stringify(cart));
        updateCartUI();
    };

    // Funções Visuais
    const openCart = () => {
        if (cartPanel) cartPanel.classList.add('active');
        if (overlay) overlay.classList.add('active');
    };

    const closeCart = () => {
        if (cartPanel) cartPanel.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    };

    if (cartIconBtn) cartIconBtn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);

    // Botão "Finalizar Compra" -> Vai para Carrinho Detalhado
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cart.length > 0) {
                window.location.href = 'carrinho.html'; 
            } else {
                alert("Seu carrinho está vazio!");
            }
        });
    }

    // Atualiza UI do Painel Lateral
    const updateCartUI = () => {
        if (cartCountDisplay) cartCountDisplay.textContent = cart.length;
        
        if (cartItemsList && cartSubtotalEl) {
            cartItemsList.innerHTML = '';
            let subtotal = 0;

            if (cart.length === 0) {
                cartItemsList.innerHTML = '<div class="cart-item-placeholder">Seu carrinho está vazio.</div>';
            } else {
                cart.forEach((item, index) => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'cart-item';
                    const price = parseFloat(item.price);
                    
                    itemEl.innerHTML = `
                        <img src="${item.imageSrc}" class="cart-item-img" onerror="this.src='https://placehold.co/70x90/1a1a1a/fff?text=IMG'">
                        <div class="cart-item-details">
                            <h4 class="cart-item-title">${item.title}</h4>
                            <span class="cart-item-price">R$ ${price.toFixed(2)}</span>
                        </div>
                        <button class="cart-remove-btn" data-index="${index}">&times;</button>
                    `;
                    cartItemsList.appendChild(itemEl);
                    subtotal += price;
                });
            }
            cartSubtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
        }
    };

    // Adicionar ao Carrinho
    const handleAddToCart = (cardElement) => {
        const title = cardElement.dataset.title;
        const price = cardElement.dataset.price;
        const imageSrc = cardElement.dataset.imageSrc;
        
        if (!title || !price) return;

        cart.push({ title, price, imageSrc });
        saveCart();
        openCart();
    };

    // Eventos de Clique (Delegação)
    document.body.addEventListener('click', (e) => {
        // Remover Item
        if (e.target.classList.contains('cart-remove-btn')) {
            const index = parseInt(e.target.dataset.index);
            cart.splice(index, 1);
            saveCart();
            if(window.location.pathname.includes('checkout.html') || window.location.pathname.includes('carrinho.html')) {
                location.reload();
            }
        }
        
        // Adicionar Jogo (Card)
        if (e.target.closest('.platform-product-card') && !e.target.closest('.platform-arrow')) {
            const card = e.target.closest('.platform-product-card');
            handleAddToCart(card);
        }

        // Adicionar Assinatura (Botão)
        if (e.target.classList.contains('btn-subscribe')) {
            e.preventDefault();
            const card = e.target.closest('.plan-card');
            if (card) handleAddToCart(card);
        }
    });

    updateCartUI(); // Inicializa


    // ====================================================================
    // 2. LÓGICA DAS PÁGINAS DE CARRINHO E CHECKOUT
    // ====================================================================
    
    const fullCartList = document.getElementById('full-cart-list');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const checkoutList = document.getElementById('checkout-summary-list');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutTotal = document.getElementById('checkout-total');

    // Renderiza Carrinho Detalhado (carrinho.html)
    if (fullCartList && summarySubtotal) {
        fullCartList.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            fullCartList.innerHTML = `
                <div class="text-center py-10">
                    <p class="text-gray-400 text-lg mb-4">Seu carrinho está vazio.</p>
                    <a href="index.html" class="text-[#00d4ff] hover:underline">Voltar para a loja</a>
                </div>`;
        } else {
            cart.forEach((item, index) => {
                const price = parseFloat(item.price);
                total += price;

                const row = document.createElement('div');
                row.className = 'cart-item-row';
                row.innerHTML = `
                    <div class="item-info">
                        <img src="${item.imageSrc}" class="item-img" onerror="this.src='https://placehold.co/80x100/1a1a1a/fff?text=IMG'">
                        <div>
                            <h3 class="font-bold text-lg text-white">${item.title}</h3>
                            <p class="text-gray-400 text-sm">Plataforma: Digital Key</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-green-400 font-bold text-lg mb-1">R$ ${price.toFixed(2)}</p>
                        <button class="cart-remove-btn btn-trash flex items-center gap-1 text-sm" data-index="${index}" style="color: #ef4444; cursor: pointer;">Remover</button>
                    </div>
                `;
                fullCartList.appendChild(row);
            });
        }
        summarySubtotal.textContent = `R$ ${total.toFixed(2)}`;
        summaryTotal.textContent = `R$ ${total.toFixed(2)}`;
    }

    // Renderiza Checkout (checkout.html)
    if (checkoutList && checkoutTotal) {
        if (cart.length === 0) {
            alert("Seu carrinho está vazio!");
            window.location.href = 'index.html';
        } else {
            checkoutList.innerHTML = '';
            let total = 0;

            cart.forEach(item => {
                const price = parseFloat(item.price);
                total += price;

                const div = document.createElement('div');
                div.className = 'summary-item';
                div.innerHTML = `
                    <img src="${item.imageSrc}" class="summary-img" onerror="this.src='https://placehold.co/60x80/1a1a1a/fff?text=IMG'">
                    <div>
                        <h4 class="font-bold text-white text-sm">${item.title}</h4>
                        <p class="text-gray-400 text-xs">Digital Key</p>
                        <p class="text-[#00d4ff] text-sm mt-1">R$ ${price.toFixed(2)}</p>
                    </div>
                `;
                checkoutList.appendChild(div);
            });

            if(checkoutSubtotal) checkoutSubtotal.textContent = `R$ ${total.toFixed(2)}`;
            if(checkoutTotal) checkoutTotal.textContent = `R$ ${total.toFixed(2)}`;
        }
    }


    // ====================================================================
    // 3. CARROSSEL PRINCIPAL (HERO SLIDER)
    // ====================================================================

    const heroSlider = document.querySelector('.hero-slider-container');
    if (heroSlider) {
        const slides = Array.from(heroSlider.querySelectorAll('.slide'));
        let slidesInner = heroSlider.querySelector('.slides-inner');
        
        if (!slidesInner && slides.length > 0) {
            slidesInner = document.createElement('div');
            slidesInner.className = 'slides-inner';
            slides.forEach(s => slidesInner.appendChild(s));
            heroSlider.insertBefore(slidesInner, heroSlider.firstChild);
        }

        const prevButton = heroSlider.querySelector('.prev-button');
        const nextButton = heroSlider.querySelector('.next-button');
        const indicatorsWrap = heroSlider.querySelector('.slider-indicators');
        let currentHeroIndex = 0; 

        const updateHeroSlide = (index) => {
            if (!slidesInner) return;
            const totalSlides = slidesInner.children.length;
            currentHeroIndex = (index + totalSlides) % totalSlides; 
            slidesInner.style.transform = `translateX(-${currentHeroIndex * 100}%)`;
            
            if (indicatorsWrap) {
                const indicators = Array.from(indicatorsWrap.children);
                indicators.forEach((ind, i) => {
                    if (i === currentHeroIndex) ind.classList.add('active');
                    else ind.classList.remove('active');
                });
            }
        };

        if (indicatorsWrap && indicatorsWrap.children.length === 0 && slidesInner) {
            Array.from(slidesInner.children).forEach((_, i) => {
                const b = document.createElement('button');
                b.className = i === 0 ? 'indicator active' : 'indicator';
                b.addEventListener('click', () => updateHeroSlide(i));
                indicatorsWrap.appendChild(b);
            });
        }

        if (prevButton) prevButton.addEventListener('click', () => updateHeroSlide(currentHeroIndex - 1));
        if (nextButton) nextButton.addEventListener('click', () => updateHeroSlide(currentHeroIndex + 1));

        let autoplayId = setInterval(() => updateHeroSlide(currentHeroIndex + 1), 5000);
        heroSlider.addEventListener('mouseenter', () => clearInterval(autoplayId));
        heroSlider.addEventListener('mouseleave', () => autoplayId = setInterval(() => updateHeroSlide(currentHeroIndex + 1), 5000));
        
        // Botões Plataforma (Apenas Slide)
        const platformBtns = document.querySelectorAll('.cta-platform');
        platformBtns.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); 
                updateHeroSlide(index); 
            });
        });
    }


    // ====================================================================
    // 4. CARROSÉIS DE PRODUTOS (RESPONSIVO)
    // ====================================================================
    
    const initPlatformCarousel = (carouselWrapper) => {
        if (!carouselWrapper) return;

        const slider = carouselWrapper.querySelector('.platform-slider');
        const slidesInner = slider.querySelector('.platform-slides-inner');
        const prevBtn = slider.querySelector('.platform-arrow.prev');
        const nextBtn = slider.querySelector('.platform-arrow.next');
        const cards = Array.from(slidesInner.querySelectorAll('.platform-product-card'));
        
        if (cards.length === 0) return;

        let currentIndex = 0;

        const getCardMetrics = () => {
            const card = cards[0];
            const style = window.getComputedStyle(card);
            const width = card.offsetWidth;
            const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            return width + margin;
        };

        const getVisibleCardsCount = () => {
            const containerWidth = slider.offsetWidth;
            const cardWidth = getCardMetrics();
            return Math.floor(containerWidth / cardWidth); 
        };

        const updatePosition = () => {
            const cardWidth = getCardMetrics();
            slidesInner.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        };

        const moveToNext = () => {
            const visibleCards = getVisibleCardsCount();
            const maxIndex = cards.length - visibleCards; 
            if (currentIndex < maxIndex) currentIndex++; else currentIndex = 0; 
            updatePosition();
        };

        const moveToPrev = () => {
            const visibleCards = getVisibleCardsCount();
            const maxIndex = cards.length - visibleCards;
            if (currentIndex > 0) currentIndex--; else currentIndex = maxIndex > 0 ? maxIndex : 0; 
            updatePosition();
        };

        if (nextBtn) nextBtn.addEventListener('click', moveToNext);
        if (prevBtn) prevBtn.addEventListener('click', moveToPrev);
        window.addEventListener('resize', () => { currentIndex = 0; updatePosition(); });
    };

    document.querySelectorAll('.platform-carousel-wrapper').forEach(initPlatformCarousel);


    // ====================================================================
    // 5. BARRA DE PESQUISA (DADOS CORRIGIDOS PELO HTML)
    // ====================================================================

    const PRODUCTS = [
        // --- XBOX ---
        { title: "Grand Theft Auto V", platform: "XBOX", price: "R$ 99,90", image: "imagens/XBOX/GTA.png" },
        { title: "F1® 25", platform: "XBOX", price: "R$ 349,90", image: "imagens/XBOX/F1.png" },
        { title: "Clair Obscur Expedition 33", platform: "XBOX", price: "R$ 349,90", image: "imagens/XBOX/Clair.png" },
        { title: "Battlefield 6", platform: "XBOX", price: "R$ 349,90", image: "imagens/XBOX/batllefield.jpg" },
        { title: "Forza Horizon 5", platform: "XBOX", price: "R$ 99,90", image: "imagens/XBOX/Forza.jpg" },

        // --- PLAYSTATION ---
        { title: "The Last of Us™ Completo", platform: "Playstation", price: "R$ 59,90", image: "imagens/Playstation/The Last.webp" },
        { title: "DEATH STRANDING 2", platform: "Playstation", price: "R$ 399,99", image: "imagens/Playstation/Death_Stranding_2.jpg" },
        { title: "Arc Raiders", platform: "Playstation", price: "R$ 44,80", image: "imagens/Playstation/Arc.png" },
        { title: "Ghost of Tsushima", platform: "Playstation", price: "R$ 44,80", image: "imagens/Playstation/ghost-of-tsushima-.webp" },
        { title: "Resient Evil 4 (Remake)", platform: "Playstation", price: "R$ 59,90", image: "imagens/Playstation/Resident.webp" },

        // --- NINTENDO ---
        { title: "Super Mario Odyssey™", platform: "Nintendo", price: "R$ 349,90", image: "imagens/Nintendo/Super Mario.png" },
        { title: "Metroid Prime™ 4", platform: "Nintendo", price: "R$ 349,90", image: "imagens/Nintendo/Metroid.png" },
        { title: "Zelda: Breath of the Wild", platform: "Nintendo", price: "R$ 349,90", image: "imagens/Nintendo/zelda.png" },
        { title: "Donkey Kong™ Banana", platform: "Nintendo", price: "R$ 199,90", image: "imagens/Nintendo/Donkey.jpg" },
        { title: "Mario Kart 8 Deluxe™", platform: "Nintendo", price: "R$ 349,90", image: "imagens/Nintendo/Mario.webp" }
    ];

    const searchInput = document.getElementById('search-input');
    const resultsDropdown = document.getElementById('search-results-dropdown');

    function handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase().trim();
        
        if (!searchTerm) {
            resultsDropdown.innerHTML = '';
            resultsDropdown.style.display = 'none';
            return;
        }

        const filteredProducts = PRODUCTS
            .filter(product => product.title.toLowerCase().includes(searchTerm))
            .slice(0, 5);

        resultsDropdown.innerHTML = ''; 

        if (filteredProducts.length > 0) {
            filteredProducts.forEach(product => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('search-result-item');
                // Estilos inline de segurança
                resultItem.style.display = 'flex';
                resultItem.style.alignItems = 'center';
                resultItem.style.padding = '10px';
                resultItem.style.cursor = 'pointer';
                resultItem.style.borderBottom = '1px solid #2d2d2d';
                
                resultItem.innerHTML = `
                    <img src="${product.image}" 
                         onerror="this.src='https://placehold.co/40x55/1a1a1a/fff?text=IMG'" 
                         style="width:40px; height:55px; object-fit:cover; margin-right:10px; border-radius:4px;" 
                         alt="${product.title}">
                    <div>
                        <div style="font-weight:bold; font-size:14px; color: white;">${product.title}</div>
                        <div style="font-size:12px; color:#ccc;">${product.platform} - <span style="color:#4ade80">${product.price}</span></div>
                    </div>
                `;
                
                resultItem.addEventListener('click', () => {
                    alert(`Você selecionou: ${product.title}`);
                    resultsDropdown.style.display = 'none';
                    searchInput.value = product.title;
                });

                resultsDropdown.appendChild(resultItem);
            });
            resultsDropdown.style.display = 'block';
        } else {
            resultsDropdown.innerHTML = '<div style="padding:10px; color:white; text-align:center;">Nenhum produto encontrado.</div>';
            resultsDropdown.style.display = 'block';
        }
    }

    if (searchInput && resultsDropdown) {
        searchInput.addEventListener('input', handleSearch);
        document.addEventListener('click', (event) => {
            if (!resultsDropdown.contains(event.target) && event.target !== searchInput) {
                resultsDropdown.style.display = 'none';
            }
        });
    }

    // ====================================================================
    // 6. SCROLL SUAVE NATIVO
    // ====================================================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            if (targetId === '#' || !targetId || this.classList.contains('cta-platform')) return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ====================================================================
    // 7. INTEGRAÇÃO PAYPAL (SANDBOX) - CHECKOUT
    // ====================================================================

    if (document.getElementById('paypal-button-container')) {
        paypal.Buttons({
            style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },

            createOrder: function(data, actions) {
                // Pega o total da tela
                const totalElement = document.getElementById('checkout-total');
                let totalValue = "1.00"; // Valor padrão de segurança

                if (totalElement) {
                    totalValue = totalElement.innerText
                        .replace('R$', '')
                        .replace(/\./g, '')
                        .replace(',', '.')
                        .trim();
                }
                
                if (parseFloat(totalValue) <= 0 || isNaN(parseFloat(totalValue))) totalValue = "1.00";

                return actions.order.create({
                    purchase_units: [{
                        description: "Compra Game Score",
                        amount: { currency_code: "BRL", value: totalValue }
                    }]
                });
            },

            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    alert(`✅ Pagamento realizado com sucesso por ${details.payer.name.given_name}!`);
                    localStorage.removeItem('gameScoreCart');
                    window.location.href = 'index.html';
                });
            },

            onError: function (err) {
                console.error('Erro no PayPal:', err);
                alert('Ocorreu um erro ao conectar com o PayPal.');
            }
        }).render('#paypal-button-container');
    }

});