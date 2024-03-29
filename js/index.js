// selecting dom elements
const close = document.querySelector('.close');
const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const html = document.querySelector('html');
const body = document.querySelector('body');
const login_link = document.querySelector('#login_link');
const logout_link = document.querySelector('#logout_link');
const user_name_element = document.querySelector('#user_data');
const user_email_element = document.querySelector('#user_email');
const authContainer = document.querySelector('.auth');
const cardContainer = document.querySelector('.pro-container');
const singleProImage = document.querySelector('.single-pro-image');
const singleProDetails = document.querySelector('.single-pro-details');
const clearCartBtn = document.querySelector('#clear-cart');
const ASSETS_URL = 'http://localhost:4000';
const API_URL = "http://localhost:0315";
const cart = document.querySelector('.cart');
const backdrop = document.querySelector('.backdrop');
const shoppingIcon = document.querySelector('.fa-shopping-bag');
const cartClose = document.querySelector('.cart .fa-times');
const checkout = document.querySelector('.checkout');
const totalPriceInCheckout = document.querySelector('.checkout .total-price');
const totalCartQuantity = document.querySelectorAll('.cart-quantity');
const newsLetterForm = document.querySelector('#newsletter form');
const addToCartBtn = document.querySelector('.add-to-cart');

/* SERVER API CALLS */

// fetch products list from database
const fetchProducts = (cardContainer) => {
    fetch(`${API_URL}/products`)
        .then(res => res.json())
        .then((result) => {
            displayProducts(cardContainer, result.data);
            return result;
        }).catch((err) => {
            console.error('something went wrong', err);
        });
}

// fetch an individual product detail by id from database
const fetchProductById = (product_id, singleProImage, singleProDetails) => {
    fetch(`${API_URL}/product/${product_id}`)
        .then(res => res.json())
        .then((result) => {
            displayProductDetails(singleProImage, singleProDetails, result.data[0]);
            return result;
        }).catch((err) => {
            console.error('something went wrong', err);
        });
}

// add product details bought by an user into database
const addUserProduct = (userCheckoutData) => {
    fetch(`${API_URL}/user_product`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: userCheckoutData }),
    }).then(res => res.json())
        .then((result) => {
            if (result.data.affectedRows) {
                const user = JSON.parse(sessionStorage.getItem('user_data'));
                Email.send({
                    Host: "smtp.elasticemail.com",
                    Username: 'ashrirao03@gmail.com',
                    Password: "8C704D3946B800855BB7567BBB70AB0987A7",
                    Port: 2525,
                    To: `${user.email}`,
                    From: "ashrirao03@gmail.com",
                    Subject: "E-Shop Order Placed Successfully",
                    Body: `Hi ${user.name} Your Order has been placed successfully !`
                }).then((message) => {
                    if (message === 'OK') {
                        Toastify({
                            text: "Your Order has been placed successfully",
                            duration: 3000,
                            newWindow: true,
                            close: true,
                            gravity: "top", // `top` or `bottom`
                            position: "center", // `left`, `center` or `right`
                            stopOnFocus: true, // Prevents dismissing of toast on hover
                            style: {
                                background: "#56b43a",
                            },
                        }).showToast();
                    } else {
                        Toastify({
                            text: "Your Order has been cancelled due to some network issues",
                            duration: 3000,
                            newWindow: true,
                            close: true,
                            gravity: "top", // `top` or `bottom`
                            position: "center", // `left`, `center` or `right`
                            stopOnFocus: true, // Prevents dismissing of toast on hover
                            style: {
                                background: "#d42525",
                            },
                        }).showToast();
                    }
                });
                localStorage.clear();
                setTimeout(() => {
                    navigate('index');
                }, 3000);
                return result;
            }
        }).catch((err) => {
            console.error('something went wrong', err);
        });
}

// update login status in the database after logout
const updateLoginStatus = (formData) => {
    fetch(`${API_URL}/login_status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
    }).then((data) => data).catch((err) => console.log(err));
}

/* UTILITY/COMMON FUNCTIONS LOGIC */

// calculate total cart items
const getTotal = (data, factor) => {
    return data.reduce((acc, cur) => {
        let total = parseInt(cur[factor]);
        total = total + acc;
        return total;
    }, 0);
}

// Function used to navigate to thank you page on form submit.
const navigate = (navigateTo) => {
    window.location.href = `${window.location.origin}/${navigateTo}.html`;
};

// fetch cart id's of products inside cart
const getCartDataIds = (cartData) => {
    const cartIds = [];
    cartData.forEach((data) => {
        cartIds.push(data.id);
    })

    return cartIds.join(',');
}

/*
  showActiveMenu: Function for showing active menu on Blogs Page
*/
const sanitizeUrl = (url) => {
    const sanitize = url.replace(/^http:\/\//, '') // remove the leading http:// (temporarily)
        .replace(/\/+/g, '/') // replace consecutive slashes with a single slash
        .replace(/\/+$/, ''); // remove trailing slashes
    const sanitizedTargetUrl = `http://${sanitize}`;
    return sanitizedTargetUrl;
};

const showActiveMenu = (csrLinks) => {
    var current = location.pathname.split('/')[1];
    if (current === "") return;
    for (var i = 0, len = csrLinks.length; i < len; i++) {
        if (csrLinks[i].getAttribute("href").indexOf(current) !== -1) {
            csrLinks[i].classList.add("active");
        } else {
            csrLinks[i].classList.remove("active");
        }
    }
};


/* DISPLAY UI LOGIC */

// display products card on the home and shop page
const displayProducts = (container, products) => {

    // calculate and display stars/rating given to a product
    const getStarsMarkup = (totalStars, productRating) => {
        const starMarkup = [];
        for (let i = 0; i < productRating; i++) {
            starMarkup.push(`<i class="fas fa-star rated"></i>`);
        }
        if (starMarkup.length < totalStars) {
            for (let i = 0; i < totalStars - productRating; i++) {
                starMarkup.push(`<i class="fas fa-star"></i>`);
            }
        }
        return starMarkup.join('');
    }

    //generate and display a product card structure
    const productMarkup = products.map((product) => {
        return `<div id=${product.id} class="pro">
            <img src="${product.image}" alt="">
            <div class="card-details">
                <div class="des">
                    <span>${product.brand_name}</span>
                    <h5>${product.title}</h5>
                    <div class="star" data-stars=${product.rating}>
                        ${getStarsMarkup(5, product.rating)}
                    </div>
                    <h4>₹ ${product.price}</h4>
                </div>
                <a href="/product.html?id=${product.id}"><i class='fas fa-cart-arrow-down'></i></a>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = productMarkup;
}

// display product details on individual product detail page
const displayProductDetails = (proImage, proDetails, result) => {
    if (proImage) {
        const mainImage = document.getElementById("MainImg");
        const smallFirstImage = document.querySelector('.small-img:first-of-type');
        smallFirstImage.src = result.image;
        mainImage.src = result.image;
    }
    if (proDetails) {
        const productTitle = document.querySelector('.product-form .title');
        const productBrand = document.querySelector('.product-form .brand');
        const productPrice = document.querySelector('.product-form .price #price');
        productTitle.innerText = result.title;
        productBrand.innerText = result.brand_name;
        productPrice.innerText = result.price;
    }
}

// display and generate structure of cart items list
const displayCartItems = () => {
    const data = JSON.parse(localStorage.getItem('cartData'));
    const cartBody = document.querySelector('.cart-body');
    let cartBodyData = '';

    if (data === null) {
        cartBodyData = '<li class="cart-item no-item">No Items in the cart please add to proceed !</li>'
    } else if (!Array.isArray(data)) {
        cartBodyData = getCartItemMarkup(data);
    } else {
        cartBodyData = data.map((cartItem) => {
            return getCartItemMarkup(cartItem);
        }).join('');
    }
    if (data !== null) {
        if (!Array.isArray(data)) {
            totalPriceInCheckout.innerText = data.price;
            totalCartQuantity.forEach(totalCartContainer => {
                totalCartContainer.innerText = data.quantity;
            })
        } else {
            const totalPrice = getTotal(data, 'price');
            const totalQuantity = getTotal(data, 'quantity');
            totalPriceInCheckout.innerText = totalPrice;
            totalCartQuantity.forEach(totalCartContainer => {
                totalCartContainer.innerText = totalQuantity;
            })
        }
    }
    cartBody.innerHTML = cartBodyData;
};

// display and generate structure of individual cart item
const getCartItemMarkup = (cartItem) => {
    return `
            <li class="cart-item">
            <div class="cart-img-container">
                <img src=${cartItem.image} alt=${cartItem.title} />
            </div>
            <div class="cart-details">
                <div class="cart-info">
                    <h3 class="cart-item-name">${cartItem.title}</h3>
                    <span>${cartItem.size}</span>
                </div>
                <div class="cart-item-details-pricing">
                <span>qty. :</span>
                <span class="cart-item-quantity">${cartItem.quantity}</span>
                <span class="cart-item-quantity--multiply">&#120;</span>
                <span class="cart-item-quantity--price">Rs ${cartItem.price}</span>
                <span>=</span>
                <span class="cart-item-quantity--total-price">
                    Rs ${cartItem.price * cartItem.quantity}
                </span>
                </div>
            </div>
            </li>  
        `;
}

/* PAGE ONLOAD LOGIC */

//  onload init functionalities
const onload = () => {
    window.onload = () => {
        close.classList.add('hide');
        if (body.classList.contains('home-page') || body.classList.contains('shop-page') || body.classList.contains('product-page')) {
            showActiveMenu(document.querySelectorAll('#navbar li a'));
            fetchProducts(cardContainer);
        }
        if (body.classList.contains('product-page')) {
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });
            let product_id = params.id;
            fetchProductById(product_id, singleProImage, singleProDetails);
        }
        displayCartItems();
        if (sessionStorage.length > 0) {
            const user = JSON.parse(sessionStorage.getItem('user_data'));
            if (user) {
                user_name_element.classList.remove('d-none');
                user_email_element.innerText = user.name;
                login_link.classList.add('d-none');
            }
        } else {
            user_name_element.classList.add('d-none');
            logout_link.classList.add('d-none');
        }
    };
    window.onload();
}


/* EVENT LISTENERS AND HANDLERS LOGIC */

// auth redirection logic
logout_link.addEventListener('click', (e) => {
    user_name_element.classList.add('d-none');
    login_link.classList.remove('d-none');
    let formData = {
        is_logged_in: false,
        email: JSON.parse(sessionStorage.getItem('user_data')).email,
    }
    updateLoginStatus(formData)
    sessionStorage.clear();
    setTimeout(() => {
        navigate('index');
    }, 500);
})

// active cart toggle menu logic
if (shoppingIcon) {
    shoppingIcon.addEventListener('click', () => {
        cart.classList.toggle('d-none');
        backdrop.classList.toggle('d-none');
        html.classList.add('overflow-hide');
        cart.classList.add('slide-left');
    })
}
if (cartClose) {
    cartClose.addEventListener('click', () => {
        cart.classList.toggle('d-none');
        backdrop.classList.toggle('d-none');
        html.classList.remove('overflow-hide');
        cart.classList.remove('slide-left');
    })
}
if (backdrop) {
    backdrop.addEventListener('click', () => {
        cart.classList.toggle('d-none');
        backdrop.classList.toggle('d-none');
        html.classList.remove('overflow-hide');
        cart.classList.remove('slide-left');
    })
}

// change header background color on scroll
let className = "inverted";
let scrollTrigger = 60;
window.onscroll = function () {
    // We add pageYOffset for compatibility with IE.
    if (window.scrollY >= scrollTrigger || window.pageYOffset >= scrollTrigger) {
        document.querySelector("#header").classList.add(className);
    } else {
        document.querySelector("#header").classList.remove(className);
    }
};

setTimeout(() => {
    const cards = document.querySelectorAll('.pro');
    let mainImage = document.querySelector("#MainImg");
    let smallImages = Array.from(document.querySelectorAll(".small-img"));

    // individual card to card details page navigation logic
    cards.forEach((card) => {
        card.addEventListener('click', (e) => {
            window.location.href = `/product.html?id=${e.target.closest('.pro').id}`;
        })
    })

    // product page image switch logic
    smallImages.forEach((smallImage) => {
        smallImage.addEventListener('click', (e) => {
            mainImage.src = e.target.src;
        })
    })
}, 5000);

// add to cart functionality
if (addToCartBtn) {
    addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let data = {};
        if (e.target.form) {
            data.image = document.getElementById("MainImg").src.split("/").slice(3).join("/");
            data.id = (new URL(window.location.href)).searchParams.get("id");
            Array.from(e.target.form.children).map((child) => {
                if (child.classList.contains('title')) data.title = child.innerText;
                if (child.classList.contains('price')) data.price = child.children['price'].innerText.replace(/\D/g, "");
                if (child.classList.contains('size')) data.size = child.value;
                if (child.classList.contains('quantity')) data.quantity = child.value;
            })
            let localData = [];
            const localStorageData = JSON.parse(localStorage.getItem('cartData'));
            if (localStorageData && !Array.isArray(localStorageData)) {
                localData.push(localStorageData);
                localData.push(data);
                localStorage.setItem('cartData', JSON.stringify(localData));
            } else if (Array.isArray(localStorageData)) {
                localData = [...localStorageData, data];
                localStorage.setItem('cartData', JSON.stringify(localData));
            } else {
                localStorage.setItem('cartData', JSON.stringify(data));
            }
            displayCartItems();
            Toastify({
                text: "Your Product has been added to cart successfully",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "#56b43a",
                },
            }).showToast();
        }
    })
};

if (clearCartBtn) {
    clearCartBtn.addEventListener('click', (e) => {
        localStorage.clear();
        displayCartItems();
    })
}

// checkout functionality
if (checkout) {
    checkout.addEventListener('click', (e) => {
        if (sessionStorage.length > 0) {
            cart.classList.toggle('d-none');
            backdrop.classList.toggle('d-none');
            html.classList.remove('overflow-hide');
            cart.classList.remove('slide-left');
            // const cartData = JSON.parse(localStorage.getItem('cartData'));
            // const cartDataIds = Array.isArray(cartData) ? getCartDataIds(cartData) : cartData.id;
            // const { id: userId } = JSON.parse(sessionStorage.getItem('user_data'));
            // let userCheckoutData = {
            //     user_id: userId,
            //     product_list: cartDataIds,
            //     total_price: totalPriceInCheckout.innerText,
            // };
            // addUserProduct(userCheckoutData);
            navigate('payment');
        } else {
            Toastify({
                text: "Please Login to proceed !",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "#d22744",
                },
            }).showToast();
            setTimeout(() => {
                navigate('login');
            }, 2000);
        }
    })
}

const paymentTypes = document.querySelectorAll('.payment-type .type');

paymentTypes.forEach((paymentType) => {
    paymentType.addEventListener('click', (e) => {
        if (e.target.closest('.type').classList.contains('selected')) {
            e.target.closest('.type').classList.remove('selected');
        } else {
            const shippingInfo = document.querySelector('.shipping .title h4');
            if (e.target.closest('.type').children[1].children[0].innerText.includes('CREDIT')) {
                shippingInfo.innerText = 'credit card info';
            } else {
                shippingInfo.innerText = 'debit card info';
            }
            paymentTypes.forEach((type) => type.classList.remove('selected'));
            e.target.closest('.type').classList.add('selected');
        }
    })
})

const billingForm = document.querySelector('#billing-form');
billingForm.addEventListener('submit', () => {
    const cartData = JSON.parse(localStorage.getItem('cartData'));
    const cartDataIds = Array.isArray(cartData) ? getCartDataIds(cartData) : cartData.id;
    const { id: userId } = JSON.parse(sessionStorage.getItem('user_data'));
    let userCheckoutData = {
        user_id: userId,
        product_list: cartDataIds,
        total_price: totalPriceInCheckout.innerText,
    };
    addUserProduct(userCheckoutData);
})

// newsletter functionality
if (newsLetterForm) {
    newsLetterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.children[0].value;
        Toastify({
            text: `${email} you have subscribe to our newsletter successfully !`,
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "green",
            },
        }).showToast();
    })
}

onload();