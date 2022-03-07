class Button {
  constructor(img,x,y,w,h) {
    this.x = x;
    this.y =y;
    this.image = img;
    this.w = w;
    this.h = h;
  }
  
  show() {
    image(this.image, this.x, this.y,this.w,this.h);
  }
} 