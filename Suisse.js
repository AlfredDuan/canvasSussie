function Suisse(defaultCreate) {
  this.c = document.getElementById("c");
  if (!this.c) {
    alert("Please add the canvas element whose id is c");
    return false;
  }

  this.mm = 0;

  (this.w = 0), (this.h = 0);
  this.ctx = c.getContext("2d");
  // 填充检测方向 四个值的说明以此是（x轴不变、y轴递减， x轴递增、y轴不变， x轴不变、y轴递增， x轴递减、y轴不变）
  this.directions = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];
  // 需要绘制的数据点的临时数据
  this.imgData = null;
  // 被填充颜色色值初始化
  this.coverFillColor = [255, 255, 255, 255];
  // 可以填充的坐标栈
  this.fillStack = [];
  // 已检测合集
  this.solvedSet = new Set();
  // 未检测合集
  this.stackedSet = new Set();
  // 颜色匹配容差值 1-200
  this.tolerance = 0;

  this.opts = {
    strokeWidth: 2,
    fillColor: "#26b9ff",
    backgroundColor: "#ddd",
    paintStrokeColor: "#000",
  };

  defaultCreate && this.createCanvas();
}
Suisse.prototype.createCanvas = function () {
  let width = document.body.clientWidth;
  let height = document.body.clientHeight;
  // let width = 200; let height = 200;

  // this.w = arguments[0] <= width ? arguments[0] : width;
  // this.h = arguments[1] <= height ? arguments[1] : height;
  this.w = parseFloat(arguments[0]) || width;
  this.h = parseFloat(arguments[1]) || height;
  this.c.width = this.w;
  this.c.height = this.h;
  this.ctx.clearRect(0, 0, this.w, this.h);
  this.ctx.fillStyle = this.opts.backgroundColor;
  this.ctx.fillRect(0, 0, this.w, this.h);

  // this.drawRect(10, 10, 20, 20);
  // this.drawRect(50, 50, 20, 20);
};
Suisse.prototype.clearCanvas = function () {
  this.ctx.clearRect(0, 0, this.w, this.h);
};
Suisse.prototype.drawLine = function (x1, y1, x2, y2) {
  this.ctx.beginPath();
  this.ctx.moveTo(x1, y1);
  this.ctx.lineTo(x2, y2);
  this.ctx.strokeStyle = this.opts.paintStrokeColor;
  this.ctx.lineWidth = this.opts.strokeWidth;
  this.ctx.stroke();
  this.ctx.closePath();
};
Suisse.prototype.drawRect = function (x1, y1, x2, y2) {
  this.ctx.beginPath();
  this.ctx.strokeStyle = this.opts.paintColor;
  this.ctx.lineWidth = this.opts.strokeWidth;
  this.ctx.rect(x1, y1, x2 - x1, y2 - y1);
  this.ctx.stroke();
  this.ctx.closePath();
};
Suisse.prototype.drawCircle = function (x, y, r) {
  this.ctx.beginPath();
  this.ctx.strokeStyle = this.opts.paintColor;
  this.ctx.lineWidth = this.opts.strokeWidth;
  this.ctx.arc(x, y, r, 0 * Math.PI, 2 * Math.PI);
  this.ctx.stroke();
  this.ctx.closePath();
};
Suisse.prototype.fillPath = function (x, y, color) {
  document.body.className = "painting";
  setTimeout(() => {
    // 避免绘制循环导致loading动画卡死，优先执行增加className
    color && (this.opts.fillColor = color);
    this.paintFillPath([parseFloat(x), parseFloat(y)]);
    document.body.className = "";
  });
};
Suisse.prototype.paintFillPath = function ([x, y]) {
  // 填充起点入栈（输入指令坐标点）
  this.fillStack = [[x, y]];

  const bool = this.invalidFillScout([x, y]);
  if (!bool) return;
  while (this.fillStack.length > 0) {
    // 绘制第一帧
    this.drippingRecursion();
  }

  console.log(this.mm);
  this.endFillPath(); // 清空getImageData数据以及入栈出栈等数据
};
Suisse.prototype.endFillPath = function () {
  this.count = 0;
  this.imgData = null;
  this.solvedSet.clear();
  this.stackedSet.clear();
  this.fillStack = [];
};
// 无效填充检查
Suisse.prototype.invalidFillScout = function ([x, y]) {
  // 更新被填充颜色（为了计算填充色值计算而更新）
  this.coverFillColor = this.ctx.getImageData(x, y, 1, 1).data;

  // 输入超出当前画布的坐标值则判定未无效坐标值
  if (x < 0 || y < 0 || x > this.w || y > this.h) {
    return alert("无效填充区域");
  }

  return true;
};
// 递归绘制
Suisse.prototype.drippingRecursion = function () {
  this.mm++;
  const [x, y] = this.fillStack.shift(); // 删除第一个坐标值，并返回给 x、y （绘制第一个点并把它删除）

  // 入栈、出栈
  this.solvedSet.add(`${x};${y}`); // 添加已经通过fill绘制过的坐标值
  this.stackedSet.delete(`${x};${y}`); // 移除已经通过fill绘制过的坐标值

  // 填充当前坐标值
  this.fill([x, y]);

  // 方向检测
  this.directionDetection([x, y]);
};
Suisse.prototype.fill = function ([x, y]) {
  if (!this.imgData) {
    // 指定坐标画单像素填充色矩形
    this.ctx.beginPath();
    this.ctx.rect(x, y, 1, 1);
    this.ctx.fillStyle = this.opts.fillColor;
    this.ctx.fill();
    this.ctx.closePath();
    // 获取这个像素的图像数据
    this.imgData = this.ctx.getImageData(x, y, 1, 1);
  } else {
    // 将刚才获取到的图像数据放回画布
    this.ctx.putImageData(this.imgData, x, y);
  }
};
Suisse.prototype.directionDetection = function ([x, y]) {
  this.directions.forEach(([dirX, dirY]) => {
    // 这个循环是根据指定的4个数组值的方向扩散的x轴，y轴的坐标值结果计算
    const dirCoord = [x + dirX, y + dirY];

    if (this.pushTesting(dirCoord)) {
      this.fillStack.push(dirCoord); // 如果需要填充则进行记录点

      if (!this.solvedSet.has(`${dirCoord[0]};${dirCoord[1]}`)) {
        this.stackedSet.add(`${dirCoord[0]};${dirCoord[1]}`); // 如果已绘制的点中没有这个点，则把它推入未绘制点栈中，以便下次while循环中进行绘制
      }
    }
  });
};
Suisse.prototype.pushTesting = function ([x, y]) {
  // 已经填充的坐标
  if (this.solvedSet.has(`${x};${y}`)) {
    return false;
  }

  // 已经入栈的坐标
  if (this.stackedSet.has(`${x};${y}`)) {
    return false;
  }

  // 获取检测点的颜色信息
  const data = this.ctx.getImageData(x, y, 1, 1).data;
  // 根据被填充色，当前点颜色，颜色容差等级的rgba值进行计算是否需要绘制当前点
  // 根据三原色或Alpha的数值来计算，当前的被填充色 - 要填充的颜色 大于 负容差 或者 小于 正容差 都是无需填充的色值，也就是被颜色区分开的闭合点
  if (
    this.coverFillColor[0] - data[0] < -this.tolerance ||
    this.coverFillColor[0] - data[0] > this.tolerance ||
    this.coverFillColor[1] - data[1] < -this.tolerance ||
    this.coverFillColor[1] - data[1] > this.tolerance ||
    this.coverFillColor[2] - data[2] < -this.tolerance ||
    this.coverFillColor[2] - data[2] > this.tolerance ||
    this.coverFillColor[3] - data[3] < -this.tolerance ||
    this.coverFillColor[3] - data[3] > this.tolerance
  ) {
    return false;
  }

  return true;
};
