import { useRef } from 'react';
import { Carousel, Image } from 'react-bootstrap';
import "./slider.css";
import imagesources from '../../assets/images';
import 'bootstrap/dist/css/bootstrap.min.css';

function Slider() {
  const carouselRef1 = useRef(null);
  const carouselRef2 = useRef(null);
  const carouselRef3 = useRef(null);
  return (
    <div>
      <div className="row slider-container">
        <div className="col-4 slider-item-container">
          <Carousel ref={carouselRef1} controls={false} indicators={false} interval={5000} pause={false}>
            <Carousel.Item>
              <Image className="slider-item" src={imagesources[0]} alt="First slide" rounded/>
            </Carousel.Item>
            <Carousel.Item>
              <Image className="slider-item" src={imagesources[1]} alt="Second slide" rounded/>
            </Carousel.Item>
            <Carousel.Item>
              <Image className="slider-item" src={imagesources[2]} alt="Third slide" rounded/>
            </Carousel.Item>
          </Carousel>
        </div>
        <div className="col-4 slider-item-container">
          <Carousel ref={carouselRef2} controls={false} indicators={false} interval={5000} pause={false}>
            <Carousel.Item>
              <Image className="slider-item" src={imagesources[1]} alt="First slide" rounded/>
            </Carousel.Item>
            <Carousel.Item>
              <Image className="slider-item" src={imagesources[2]} alt="Second slide" rounded/>
            </Carousel.Item>
            <Carousel.Item>
              <Image className="slider-item" src={imagesources[0]} alt="Third slide" rounded/>
            </Carousel.Item>
          </Carousel>
        </div>
        <div className="col-4 slider-item-container">
          <Carousel ref={carouselRef3} controls={false} indicators={false} interval={5000} pause={false}>
            <Carousel.Item>
              <Image className="slider-item" src={imagesources[2]} alt="First slide" rounded/>
            </Carousel.Item>
            <Carousel.Item>
              <Image className="slider-item" src={imagesources[0]} alt="Second slide" rounded/>
            </Carousel.Item>
            <Carousel.Item>
              <Image className="slider-item" src={imagesources[1]} alt="Third slide" rounded/>
            </Carousel.Item>
          </Carousel>
        </div>
      </div>
    </div>
  );
}

export default Slider;