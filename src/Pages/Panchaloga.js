import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Modal, Image } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, ShoppingCart, X, ZoomIn } from 'lucide-react';
import { db, storage } from '../firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header/Header';
import Footer from '../Components/Footer/Footer';
import banner from '../Images/products/product baanner.jpg';

const StyledPanjaloga = styled.div`
  font-family: 'Lora', serif;

  h1 {
    text-align: center;
    font-weight: bolder;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  h3 {
    text-align: center;
    font-weight: bolder;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .card {
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    

    &:hover {
      transform: translateY(-5px);
    }
  }

  .card-img-top {
    object-fit: cover;
    height: 200px;
    cursor: pointer;
  }

  .card-title {
    font-size: 1.1rem;
    font-weight: bold;
  }

  .price {
    font-size: 1.2rem;
    font-weight: bold;
    color: #000;
    background-color: #FFE31A;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .original-price {
    text-decoration: line-through;
    color: #6c757d;
  }

  .btn-danger {
    background-color: #FF0000;
    border-color: #FF0000;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #D10000;
      border-color: #D10000;
    }
  }

  .scroll-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1000;
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.8);
    border: none;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    cursor: pointer;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: rgba(255, 255, 255, 1);
    }

    &.left {
      left: 0;
    }

    &.right {
      right: 0;
    }
  }

  .product-container {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    gap: 1rem;
    padding: 1rem 0;

    &::-webkit-scrollbar {
      display: none;
    }
    
    & > div {
      scroll-snap-align: start;
      flex: 0 0 auto;
      width: 250px;
    }
  }

  @media (min-width: 768px) {
    .product-container {
      flex-wrap: nowrap;
      overflow-x: hidden;
      justify-content: flex-start;
      
      & > div {
        width: 25%;
        margin-right: 0;
      }
    }
  }
`;

const StyledCartModal = styled(Modal)`
  .modal-content {
    border-radius: 15px;
    border: none;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .modal-header {
    border-bottom: none;
    padding: 15px 15px 0;
    background-color: #f8f9fa;
  }

  .modal-body {
    padding: 15px;
    background-color: #f8f9fa;
  }

  .product-image {
    width: 100%;
    max-width: 120px;
    height: auto;
    object-fit: cover;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
  }

  .product-title {
    color: #A41E19;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .price-display {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .current-price {
    font-size: 22px;
    font-weight: bold;
    color: #A41E19;
  }

  .original-price {
    text-decoration: line-through;
    color: #6c757d;
    font-size: 14px;
  }

  .savings {
    background-color: #FFE31A;
    padding: 4px 8px;
    border-radius: 12px;
    display: inline-block;
    margin-bottom: 15px;
    font-weight: bold;
    font-size: 12px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .divider {
    border-top: 1px solid #dee2e6;
    margin: 12px 0;
  }

  .price-summary {
    color: #A41E19;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
  }

  .grand-total {
    color: #A41E19;
    font-size: 18px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
    padding: 8px 0;
    border-top: 2px solid #A41E19;
    border-bottom: 2px solid #A41E19;
  }

  .btn-checkout {
    background-color: #FFE31A;
    border: none;
    color: black;
    font-weight: bold;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 20px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    &:hover {
      background-color: #e6cc17;
      color: black;
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }
  }

  .btn-cancel {
    background-color: #A41E19;
    border: none;
    color: white;
    font-weight: bold;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 20px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    &:hover {
      background-color: #8a1915;
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }
  }

  .button-container {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 15px;
  }

  .close-button {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 18px;
    color: #A41E19;
    cursor: pointer;
    transition: color 0.3s ease;
    &:hover {
      color: #8a1915;
    }
  }

  @media (min-width: 576px) {
    .modal-dialog {
      max-width: 400px;
    }
  }

  @media (max-width: 575px) {
    .modal-dialog {
      margin: 0.5rem;
    }

    .product-image {
      max-width: 100px;
    }

    .product-title {
      font-size: 18px;
    }

    .current-price {
      font-size: 20px;
    }

    .original-price {
      font-size: 12px;
    }

    .savings {
      font-size: 11px;
    }

    .price-summary {
      font-size: 14px;
    }

    .summary-row {
      font-size: 12px;
    }

    .grand-total {
      font-size: 16px;
    }

    .btn-checkout, .btn-cancel {
      padding: 6px 12px;
      font-size: 12px;
    }
  }

  @media (min-width: 992px) {
    .modal-dialog {
      max-width: 450px;
    }
  }
`;

const ZoomModal = styled(Modal)`
  .modal-content {
    background-color: transparent;
    border: none;
  }

  .modal-body {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
  }

  .zoomed-image-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .zoomed-image {
    max-width: 80%;
    max-height: 80vh;
    object-fit: contain;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.7);
    border: none;
    color: #333;
    font-size: 24px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.3s ease;
    z-index: 1050;

    &:hover {
      background-color: rgba(255, 255, 255, 0.9);
    }
  }

  @media (max-width: 1024px) {
    .zoomed-image {
      max-width: 90%;
      max-height: 90vh;
    }
  }

  @media (max-width: 768px) {
    .zoomed-image {
      max-width: 95%;
      max-height: 95vh;
    }

    .close-button {
      top: 5px;
      right: 5px;
      font-size: 20px;
      width: 30px;
      height: 30px;
    }
  }
`;

const ImageNavButton = styled(Button)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
  color: #333;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  z-index: 10;

  &:hover {
    background-color: rgba(255, 255, 255, 0.9);
  }

  &.prev {
    left: 5px;
  }

  &.next {
    right: 5px;
  }
`;

const Panjaloga = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showContent, setShowContent] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState('');
  const categoryRefs = useRef({});
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const productsCollection = collection(db, 'products');
      const q = query(productsCollection, where("page", "==", "Panjaloga"));
      const productsSnapshot = await getDocs(q);
    
      if (!productsSnapshot.empty) {
        setShowContent(true);
        const productsList = productsSnapshot.docs.map((doc) => {
          const productData = doc.data();
          return {
            id: doc.id,
            ...productData,
            images: productData.images || [],
          };
        });
        setProducts(productsList);
        setFilteredProducts(productsList);
        
        const initialImageIndices = {};
        productsList.forEach(product => {
          initialImageIndices[product.id] = 0;
        });
        setCurrentImageIndex(initialImageIndices);
      } else {
        setShowContent(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories= async () => {
    try {
      const categoriesCollection = collection(db, 'categories');
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesList = categoriesSnapshot.docs.map(doc => doc.data().name);
      setCategories(categoriesList);
      
      categoriesList.forEach(category => {
        if (!categoryRefs.current[category]) {
          categoryRefs.current[category] = React.createRef();
        }
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setShowCartModal(true);
  };

  const handleImageClick = (imageUrl) => {
    setZoomedImage(imageUrl);
    setShowZoomModal(true);
  };

  const handlePrevImage = (productId) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [productId]: (prev[productId] - 1 + products.find(p => p.id === productId).images.length) % products.find(p => p.id === productId).images.length
    }));
  };

  const handleNextImage = (productId) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [productId]: (prev[productId] + 1) % products.find(p => p.id === productId).images.length
    }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const renderProductCard = (product) => {
    const currentIndex = currentImageIndex[product.id] || 0;

    return (
      <div key={product.id} className="flex-shrink-0 mb-4">
        <Card className="h-100 border-0 shadow-sm" style={{ width: '250px' }}>
          <div className="position-relative" style={{ paddingTop: '100%' }}>
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex">
              {product.images && product.images.length > 0 ? (
                <Card.Img
                  variant="top"
                  src={product.images[currentIndex]}
                  alt={`${product.name} - ${currentIndex + 1}`}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                  onClick={() => handleImageClick(product.images[currentIndex])}
                />
              ) : (
                <Card.Img
                  variant="top"
                  src="/placeholder.svg"
                  alt={product.name}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <>
                <ImageNavButton
                  className="prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage(product.id);
                  }}
                >
                  &lt;
                </ImageNavButton>
                <ImageNavButton
                  className="next"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage(product.id);
                  }}
                >
                  &gt;
                </ImageNavButton>
              </>
            )}
            <Button 
              className="position-absolute top-0 end-0 m-2 p-1 bg-white rounded-circle"
              style={{ width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              onClick={() => handleImageClick(product.images && product.images.length > 0 ? product.images[currentIndex] : '/placeholder.svg')}
              variant="light"
            >
              <ZoomIn size={20} />
            </Button>
          </div>
          <Card.Body className="text-center d-flex flex-column justify-content-between">
            <div>
              <Card.Title className="fs-5 mb-3">{product.name}</Card.Title>
              <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                <span className="fs-5 fw-bold px-2" style={{ color: '#000', backgroundColor: "#FFE31A" }}>
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="text-decoration-line-through text-muted">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              </div>
            </div>
            <Button 
              variant="danger" 
              className="w-100"
              style={{ 
                backgroundColor: '#FF0000',
                borderColor: '#FF0000'
              }}
              onClick={() => handleAddToCart(product)}
            >
              Add to Cart
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  };

  const scrollProducts = (ref, direction) => {
    const container = ref.current;
    if (container) {
      const scrollAmount = container.clientWidth;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const renderScrollButtons = (ref) => (
    <>
      <button
        className="scroll-button left d-none d-md-flex"
        onClick={() => scrollProducts(ref, 'left')}
      >
        <ChevronLeft size={24} color="#333" />
      </button>
      <button
        className="scroll-button right d-none d-md-flex"
        onClick={() => scrollProducts(ref, 'right')}
      >
        <ChevronRight size={24} color="#333" />
      </button>
    </>
  );

  const handleCheckout = () => {
    setShowCartModal(false);
    navigate('/checkout', { state: { product: selectedProduct } });
  };

  return (
    <div>
      <Header onSearch={handleSearch} />
      <div className="">
        <img className='img-fluid' src={banner} alt="" />
      </div>
      {showContent && (
        <StyledPanjaloga>
          <Container>
            <h1>Panjaloga</h1>
            {categories.map((category) => {
              const categoryProducts = filteredProducts.filter(product => product.category === category);
              if (categoryProducts.length === 0) return null;

              return (
                <div key={category} className="mb-5">
                  <h3>{category}</h3>
                  <div className="position-relative">
                    {renderScrollButtons(categoryRefs.current[category])}
                    <div
                      className="product-container"
                      ref={categoryRefs.current[category]}
                    >
                      {categoryProducts.map(renderProductCard)}
                    </div>
                  </div>
                </div>
              );
            })}
          </Container>
        </StyledPanjaloga>
      )}

      <StyledCartModal
        show={showCartModal}
        onHide={() => setShowCartModal(false)}
        centered
        size="sm"
      >
        <Modal.Header>
          <h6 style={{backgroundColor:"#A41E19", color:"#FFE31A"}} className='text-center py-2 px-3 rounded'>
            <ShoppingCart size={18} className="me-2" />
            Your Cart
          </h6>
          <button className="close-button text-light" onClick={() => setShowCartModal(false)}>
            <X size={28} />
          </button>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <>
              <div className="text-center">
                <Image src={selectedProduct.images[0]} alt={selectedProduct.name} className="product-image" />
              </div>
              <h2 className="product-title">{selectedProduct.name}</h2>
              <div className="price-display">
                <span className="current-price">₹{selectedProduct.price.toFixed(2)}</span>
                <span className="original-price">₹{selectedProduct.originalPrice.toFixed(2)}</span>
              </div>
              <div className="savings">
                You Save ₹{(selectedProduct.originalPrice - selectedProduct.price).toFixed(2)}
              </div>
              <div className="divider"></div>
              <div className="price-summary">Price Summary</div>
              <div className="summary-row">
                <span>Total MRP (Incl. of taxes)</span>
                <span>₹{selectedProduct.originalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Cart Discount</span>
                <span>- ₹{(selectedProduct.originalPrice - selectedProduct.price).toFixed(2)}</span>
              </div>
              <div className="divider"></div>
              <div className="grand-total">
                <span>Grand Total</span>
                <span>₹{selectedProduct.price.toFixed(2)}</span>
              </div>
              <div className="button-container">
                <Button variant="secondary" className="btn-cancel" onClick={() => setShowCartModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="btn-checkout" onClick={handleCheckout}>
                  Checkout
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </StyledCartModal>

      <ZoomModal
        show={showZoomModal}
        onHide={() => setShowZoomModal(false)}
        centered
        size="xl"
      >
        <Modal.Body>
          <div className="zoomed-image-container">
            <img src={zoomedImage} alt="Zoomed product" className="zoomed-image" />
            <button className="close-button" onClick={() => setShowZoomModal(false)}>
              <X size={24} />
            </button>
          </div>
        </Modal.Body>
      </ZoomModal>

      <Footer />
    </div>
  );
};

export default Panjaloga;

