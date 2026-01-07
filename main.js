var canvas;
var gl;

// Objetos da cena
var objects = [];
var lights = [];

// Câmera
var camera = {
  rotateX: 30, // Rotação Vertical
  rotateY: 45, // Rotação Horizontal
  distance: 20, // Zoom
  translateX: 0,
  translateY: 0,
};

// Variáveis para controle do Mouse
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

// Projeção
var projection = {
  fov: 45,
  near: 0.1,
  far: 100,
  aspect: 1,
};

// Luzes
var light1 = {
  position: vec3(5, 5, 5),
  color: vec3(1, 1, 1),
  intensity: 1.0,
};

var light2 = {
  position: vec3(-5, 5, -5),
  color: vec3(0.5, 0.5, 1),
  intensity: 0.8,
};

var animationsEnabled = true;
var time = 0;

var program;
var modelMatrixLoc, viewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;

var materialAmbientLoc,
  materialDiffuseLoc,
  materialSpecularLoc,
  materialShininessLoc;
var light1PositionLoc, light1ColorLoc, light1IntensityLoc;
var light2PositionLoc, light2ColorLoc, light2IntensityLoc;
var viewPositionLoc, useTextureLoc, uTextureLoc, isLightLoc;

var texture;

window.onload = init;

o;
function rotateX(angle) {
  return rotate(angle, vec3(1, 0, 0));
}
function rotateY(angle) {
  return rotate(angle, vec3(0, 1, 0));
}
function rotateZ(angle) {
  return rotate(angle, vec3(0, 0, 1));
}

function SceneObject(
  vertices,
  normals,
  texCoords,
  material,
  hasTexture,
  position,
  scale,
  rotation
) {
  this.vertices = vertices;
  this.normals = normals;
  this.texCoords = texCoords;
  this.material = material;
  this.hasTexture = hasTexture;
  this.position = position || vec3(0, 0, 0);
  this.scale = scale || vec3(1, 1, 1);
  this.rotation = rotation || vec3(0, 0, 0);
  this.animation = {
    position: vec3(0, 0, 0),
    rotation: vec3(0, 0, 0),
    scale: vec3(1, 1, 1),
  };

  this.vertexBuffer = null;
  this.normalBuffer = null;
  this.texCoordBuffer = null;
  this.numVertices = vertices.length;
}

function generateSphere(radius, slices, stacks) {
  var vertices = [];
  var normals = [];
  var texCoords = [];
  for (var i = 0; i <= stacks; i++) {
    var theta = (i * Math.PI) / stacks;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    for (var j = 0; j <= slices; j++) {
      var phi = (j * 2 * Math.PI) / slices;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);
      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;
      vertices.push(vec3(radius * x, radius * y, radius * z));
      normals.push(vec3(x, y, z));
      texCoords.push(vec2(j / slices, i / stacks));
    }
  }
  var indices = [];
  for (var i = 0; i < stacks; i++) {
    for (var j = 0; j < slices; j++) {
      var first = i * (slices + 1) + j;
      var second = first + slices + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }
  var finalVertices = [];
  var finalNormals = [];
  var finalTexCoords = [];
  for (var i = 0; i < indices.length; i++) {
    finalVertices.push(vertices[indices[i]]);
    finalNormals.push(normals[indices[i]]);
    finalTexCoords.push(texCoords[indices[i]]);
  }
  return {
    vertices: finalVertices,
    normals: finalNormals,
    texCoords: finalTexCoords,
  };
}

function generateCube() {
  var vertices = [
    vec3(-0.5, -0.5, 0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(-0.5, -0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(0.5, -0.5, -0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, 0.5, -0.5),
    vec3(0.5, -0.5, -0.5),
    vec3(-0.5, 0.5, -0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(-0.5, 0.5, -0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(0.5, -0.5, -0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, 0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(0.5, -0.5, -0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, -0.5, 0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(-0.5, 0.5, -0.5),
  ];
  var normals = [
    vec3(0, 0, 1),
    vec3(0, 0, 1),
    vec3(0, 0, 1),
    vec3(0, 0, 1),
    vec3(0, 0, 1),
    vec3(0, 0, 1),
    vec3(0, 0, -1),
    vec3(0, 0, -1),
    vec3(0, 0, -1),
    vec3(0, 0, -1),
    vec3(0, 0, -1),
    vec3(0, 0, -1),
    vec3(0, 1, 0),
    vec3(0, 1, 0),
    vec3(0, 1, 0),
    vec3(0, 1, 0),
    vec3(0, 1, 0),
    vec3(0, 1, 0),
    vec3(0, -1, 0),
    vec3(0, -1, 0),
    vec3(0, -1, 0),
    vec3(0, -1, 0),
    vec3(0, -1, 0),
    vec3(0, -1, 0),
    vec3(1, 0, 0),
    vec3(1, 0, 0),
    vec3(1, 0, 0),
    vec3(1, 0, 0),
    vec3(1, 0, 0),
    vec3(1, 0, 0),
    vec3(-1, 0, 0),
    vec3(-1, 0, 0),
    vec3(-1, 0, 0),
    vec3(-1, 0, 0),
    vec3(-1, 0, 0),
    vec3(-1, 0, 0),
  ];
  var texCoords = [];
  for (var i = 0; i < 6; i++) {
    texCoords.push(
      vec2(0, 0),
      vec2(1, 0),
      vec2(1, 1),
      vec2(0, 0),
      vec2(1, 1),
      vec2(0, 1)
    );
  }
  return { vertices: vertices, normals: normals, texCoords: texCoords };
}

function generateTorus(innerRadius, outerRadius, slices, stacks) {
  var vertices = [];
  var normals = [];
  var texCoords = [];
  for (var i = 0; i <= stacks; i++) {
    var u = (i / stacks) * 2 * Math.PI;
    var cosU = Math.cos(u);
    var sinU = Math.sin(u);
    for (var j = 0; j <= slices; j++) {
      var v = (j / slices) * 2 * Math.PI;
      var cosV = Math.cos(v);
      var sinV = Math.sin(v);
      var radius = innerRadius + outerRadius * cosV;
      var x = radius * cosU;
      var y = radius * sinU;
      var z = outerRadius * sinV;
      vertices.push(vec3(x, y, z));
      var nx = cosV * cosU;
      var ny = cosV * sinU;
      var nz = sinV;
      normals.push(vec3(nx, ny, nz));
      texCoords.push(vec2(i / stacks, j / slices));
    }
  }
  var indices = [];
  for (var i = 0; i < stacks; i++) {
    for (var j = 0; j < slices; j++) {
      var first = i * (slices + 1) + j;
      var second = first + slices + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }
  var finalVertices = [];
  var finalNormals = [];
  var finalTexCoords = [];
  for (var i = 0; i < indices.length; i++) {
    finalVertices.push(vertices[indices[i]]);
    finalNormals.push(normals[indices[i]]);
    finalTexCoords.push(texCoords[indices[i]]);
  }
  return {
    vertices: finalVertices,
    normals: finalNormals,
    texCoords: finalTexCoords,
  };
}

function generatePyramid() {
  var vertices = [
    vec3(-0.5, -0.5, -0.5),
    vec3(0.5, -0.5, -0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, 0.5),
    vec3(0, 0.5, 0),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, -0.5, 0.5),
    vec3(0, 0.5, 0),
    vec3(0.5, -0.5, 0.5),
    vec3(0.5, -0.5, -0.5),
    vec3(0, 0.5, 0),
    vec3(-0.5, -0.5, 0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(0, 0.5, 0),
    vec3(0.5, -0.5, -0.5),
    vec3(-0.5, -0.5, -0.5),
  ];
  var normals = [];
  for (var i = 0; i < 6; i++) normals.push(vec3(0, -1, 0));
  var n1 = normalize(
    cross(
      subtract(vec3(-0.5, -0.5, 0.5), vec3(0, 0.5, 0)),
      subtract(vec3(-0.5, -0.5, -0.5), vec3(0, 0.5, 0))
    )
  );
  for (var i = 0; i < 3; i++) normals.push(n1);
  var n2 = normalize(
    cross(
      subtract(vec3(0.5, -0.5, -0.5), vec3(0, 0.5, 0)),
      subtract(vec3(0.5, -0.5, 0.5), vec3(0, 0.5, 0))
    )
  );
  for (var i = 0; i < 3; i++) normals.push(n2);
  var n3 = normalize(
    cross(
      subtract(vec3(0.5, -0.5, 0.5), vec3(0, 0.5, 0)),
      subtract(vec3(-0.5, -0.5, 0.5), vec3(0, 0.5, 0))
    )
  );
  for (var i = 0; i < 3; i++) normals.push(n3);
  var n4 = normalize(
    cross(
      subtract(vec3(-0.5, -0.5, -0.5), vec3(0, 0.5, 0)),
      subtract(vec3(0.5, -0.5, -0.5), vec3(0, 0.5, 0))
    )
  );
  for (var i = 0; i < 3; i++) normals.push(n4);
  var texCoords = [];
  for (var i = 0; i < vertices.length; i++) texCoords.push(vec2(0, 0));
  return { vertices: vertices, normals: normals, texCoords: texCoords };
}

function createCheckerboardTexture(size) {
  var image = new Uint8Array(4 * size * size);
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      var c = ((i & 0x8) == 0) ^ ((j & 0x8) == 0) ? 255 : 128;
      var index = 4 * (i * size + j);
      image[index] = c;
      image[index + 1] = c;
      image[index + 2] = c;
      image[index + 3] = 255;
    }
  }
  return image;
}

// --------------------------------------------------------------------------

function init() {
  canvas = document.getElementById("gl-canvas");
  if (!canvas) {
    alert("Canvas não encontrado!");
    return;
  }

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL não está disponível");
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.1, 0.1, 0.15, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  if (program < 0) {
    alert("Erro ao carregar shaders");
    return;
  }
  gl.useProgram(program);

  // --- CAPTURA DE UNIFORMS ---
  modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
  viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

  materialAmbientLoc = gl.getUniformLocation(program, "materialAmbient");
  materialDiffuseLoc = gl.getUniformLocation(program, "materialDiffuse");
  materialSpecularLoc = gl.getUniformLocation(program, "materialSpecular");
  materialShininessLoc = gl.getUniformLocation(program, "materialShininess");

  light1PositionLoc = gl.getUniformLocation(program, "light1Position");
  light1ColorLoc = gl.getUniformLocation(program, "light1Color");
  light1IntensityLoc = gl.getUniformLocation(program, "light1Intensity");

  light2PositionLoc = gl.getUniformLocation(program, "light2Position");
  light2ColorLoc = gl.getUniformLocation(program, "light2Color");
  light2IntensityLoc = gl.getUniformLocation(program, "light2Intensity");

  viewPositionLoc = gl.getUniformLocation(program, "viewPosition");
  useTextureLoc = gl.getUniformLocation(program, "useTexture");
  uTextureLoc = gl.getUniformLocation(program, "uTexture");
  isLightLoc = gl.getUniformLocation(program, "isLight");

  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  var checkerboard = createCheckerboardTexture(64);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    64,
    64,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    checkerboard
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  // --- CRIAÇÃO DOS OBJETOS ---
  // 1. Esfera
  var sphereData = generateSphere(1.0, 32, 32);
  var sphere = new SceneObject(
    sphereData.vertices,
    sphereData.normals,
    sphereData.texCoords,
    {
      ambient: vec3(0.2, 0.1, 0.1),
      diffuse: vec3(0.8, 0.4, 0.4),
      specular: vec3(1.0, 1.0, 1.0),
      shininess: 50.0,
    },
    true,
    vec3(-3, 0, 0),
    vec3(1, 1, 1),
    vec3(0, 0, 0)
  );
  sphere.animation.rotation = vec3(0, 1, 0);
  objects.push(sphere);

  // 2. Cubo
  var cubeData = generateCube();
  var cube = new SceneObject(
    cubeData.vertices,
    cubeData.normals,
    cubeData.texCoords,
    {
      ambient: vec3(0.1, 0.2, 0.1),
      diffuse: vec3(0.4, 0.8, 0.4),
      specular: vec3(0.8, 0.8, 0.8),
      shininess: 32.0,
    },
    false,
    vec3(3, 0, 0),
    vec3(1, 1, 1),
    vec3(0, 0, 0)
  );
  cube.animation.rotation = vec3(1, 1, 0);
  objects.push(cube);

  // 3. Torus
  var torusData = generateTorus(0.5, 1.0, 32, 32);
  var torus = new SceneObject(
    torusData.vertices,
    torusData.normals,
    torusData.texCoords,
    {
      ambient: vec3(0.1, 0.1, 0.2),
      diffuse: vec3(0.4, 0.4, 0.8),
      specular: vec3(0.9, 0.9, 0.9),
      shininess: 64.0,
    },
    false,
    vec3(0, 0, 3),
    vec3(1, 1, 1),
    vec3(0, 0, 0)
  );
  torus.animation.rotation = vec3(0, 0, 1);
  torus.animation.position = vec3(0, 0.5, 0);
  objects.push(torus);

  // 4. Pirâmide
  var pyramidData = generatePyramid();
  var pyramid = new SceneObject(
    pyramidData.vertices,
    pyramidData.normals,
    pyramidData.texCoords,
    {
      ambient: vec3(0.2, 0.2, 0.1),
      diffuse: vec3(0.8, 0.8, 0.4),
      specular: vec3(0.7, 0.7, 0.7),
      shininess: 25.0,
    },
    false,
    vec3(0, 0, -3),
    vec3(1, 1, 1),
    vec3(0, 0, 0)
  );
  pyramid.animation.rotation = vec3(1, 0, 1);
  pyramid.animation.scale = vec3(1.2, 1.2, 1.2);
  objects.push(pyramid);

  // Buffers Objetos
  for (var i = 0; i < objects.length; i++) {
    var obj = objects[i];
    obj.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.vertices), gl.STATIC_DRAW);
    obj.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.normals), gl.STATIC_DRAW);
    obj.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.texCoords), gl.STATIC_DRAW);
  }

  // --- CRIAÇÃO DAS LUZES ---
  var lightSphereData = generateSphere(0.2, 16, 16);
  var light1Obj = new SceneObject(
    lightSphereData.vertices,
    lightSphereData.normals,
    lightSphereData.texCoords,
    {
      ambient: vec3(1, 1, 1),
      diffuse: vec3(1, 1, 1),
      specular: vec3(0, 0, 0),
      shininess: 1.0,
    },
    false,
    light1.position,
    vec3(1, 1, 1),
    vec3(0, 0, 0)
  );
  lights.push(light1Obj);

  var light2Obj = new SceneObject(
    lightSphereData.vertices,
    lightSphereData.normals,
    lightSphereData.texCoords,
    {
      ambient: vec3(0.5, 0.5, 1),
      diffuse: vec3(0.5, 0.5, 1),
      specular: vec3(0, 0, 0),
      shininess: 1.0,
    },
    false,
    light2.position,
    vec3(1, 1, 1),
    vec3(0, 0, 0)
  );
  lights.push(light2Obj);

  // Buffers Luzes
  for (var i = 0; i < lights.length; i++) {
    var light = lights[i];
    light.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, light.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(light.vertices), gl.STATIC_DRAW);
    light.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, light.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(light.normals), gl.STATIC_DRAW);
    light.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, light.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(light.texCoords), gl.STATIC_DRAW);
  }

  setupControls();
  render();
}

function setupControls() {
  // --- MUDANÇA: CONFIGURAÇÃO DO MOUSE ---
  canvas.onmousedown = function (e) {
    mouseDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  };

  document.onmouseup = function (e) {
    mouseDown = false;
  };

  canvas.onmousemove = function (e) {
    if (!mouseDown) {
      return;
    }
    var newX = e.clientX;
    var newY = e.clientY;

    var deltaX = newX - lastMouseX;
    var deltaY = newY - lastMouseY;

    // Sensibilidade
    camera.rotateY -= deltaX * 0.5;
    camera.rotateX -= deltaY * 0.5;

    // Limitar o eixo vertical para não virar de cabeça para baixo
    if (camera.rotateX > 89) camera.rotateX = 89;
    if (camera.rotateX < -89) camera.rotateX = -89;

    lastMouseX = newX;
    lastMouseY = newY;

    // Atualiza os sliders HTML para ficarem sincronizados
    document.getElementById("camera-rotate-x").value = camera.rotateX;
    document.getElementById("camera-rotate-y").value = camera.rotateY;
  };

  // Zoom com a roda do mouse
  canvas.onwheel = function (e) {
    e.preventDefault();
    camera.distance += e.deltaY * 0.05;
    if (camera.distance < 2) camera.distance = 2; // Zoom máximo
    if (camera.distance > 100) camera.distance = 100; // Zoom mínimo
    document.getElementById("camera-distance").value = camera.distance;
  };

  // --- CONTROLES HTML EXISTENTES ---
  document
    .getElementById("camera-rotate-x")
    .addEventListener("input", function (e) {
      camera.rotateX = parseFloat(e.target.value);
    });
  document
    .getElementById("camera-rotate-y")
    .addEventListener("input", function (e) {
      camera.rotateY = parseFloat(e.target.value);
    });
  document
    .getElementById("camera-distance")
    .addEventListener("input", function (e) {
      camera.distance = parseFloat(e.target.value);
    });
  document
    .getElementById("camera-translate-x")
    .addEventListener("input", function (e) {
      camera.translateX = parseFloat(e.target.value);
    });
  document
    .getElementById("camera-translate-y")
    .addEventListener("input", function (e) {
      camera.translateY = parseFloat(e.target.value);
    });
  document
    .getElementById("reset-camera")
    .addEventListener("click", function () {
      camera.rotateX = 30;
      camera.rotateY = 45;
      camera.distance = 20;
      camera.translateX = 0;
      camera.translateY = 0;
      document.getElementById("camera-rotate-x").value = 30;
      document.getElementById("camera-rotate-y").value = 45;
      document.getElementById("camera-distance").value = 20;
      document.getElementById("camera-translate-x").value = 0;
      document.getElementById("camera-translate-y").value = 0;
    });

  document.getElementById("fov").addEventListener("input", function (e) {
    projection.fov = parseFloat(e.target.value);
  });
  document.getElementById("near").addEventListener("input", function (e) {
    projection.near = parseFloat(e.target.value);
  });
  document.getElementById("far").addEventListener("input", function (e) {
    projection.far = parseFloat(e.target.value);
  });
  document.getElementById("aspect").addEventListener("input", function (e) {
    projection.aspect = parseFloat(e.target.value);
  });

  document.getElementById("light1-x").addEventListener("input", function (e) {
    light1.position[0] = parseFloat(e.target.value);
    lights[0].position[0] = light1.position[0];
  });
  document.getElementById("light1-y").addEventListener("input", function (e) {
    light1.position[1] = parseFloat(e.target.value);
    lights[0].position[1] = light1.position[1];
  });
  document.getElementById("light1-z").addEventListener("input", function (e) {
    light1.position[2] = parseFloat(e.target.value);
    lights[0].position[2] = light1.position[2];
  });
  document
    .getElementById("light1-intensity")
    .addEventListener("input", function (e) {
      light1.intensity = parseFloat(e.target.value);
    });
  document.getElementById("light1-r").addEventListener("input", function (e) {
    light1.color[0] = parseFloat(e.target.value);
  });
  document.getElementById("light1-g").addEventListener("input", function (e) {
    light1.color[1] = parseFloat(e.target.value);
  });
  document.getElementById("light1-b").addEventListener("input", function (e) {
    light1.color[2] = parseFloat(e.target.value);
  });

  document.getElementById("light2-x").addEventListener("input", function (e) {
    light2.position[0] = parseFloat(e.target.value);
    lights[1].position[0] = light2.position[0];
  });
  document.getElementById("light2-y").addEventListener("input", function (e) {
    light2.position[1] = parseFloat(e.target.value);
    lights[1].position[1] = light2.position[1];
  });
  document.getElementById("light2-z").addEventListener("input", function (e) {
    light2.position[2] = parseFloat(e.target.value);
    lights[1].position[2] = light2.position[2];
  });
  document
    .getElementById("light2-intensity")
    .addEventListener("input", function (e) {
      light2.intensity = parseFloat(e.target.value);
    });
  document.getElementById("light2-r").addEventListener("input", function (e) {
    light2.color[0] = parseFloat(e.target.value);
  });
  document.getElementById("light2-g").addEventListener("input", function (e) {
    light2.color[1] = parseFloat(e.target.value);
  });
  document.getElementById("light2-b").addEventListener("input", function (e) {
    light2.color[2] = parseFloat(e.target.value);
  });

  document
    .getElementById("animations-enabled")
    .addEventListener("change", function (e) {
      animationsEnabled = e.target.checked;
    });
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (objects.length === 0) {
    requestAnimFrame(render);
    return;
  }

  time += 0.01;

  // 1. Matriz de Projeção
  var aspect = (canvas.width / canvas.height) * projection.aspect;
  var projMatrix = perspective(
    projection.fov,
    aspect,
    projection.near,
    projection.far
  );
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projMatrix));

  // 2. Matriz de Visualização (Câmera) - CONTROLADA PELO MOUSE
  var rotXRad = radians(camera.rotateX);
  var rotYRad = radians(camera.rotateY);
  var cameraX = camera.distance * Math.cos(rotXRad) * Math.sin(rotYRad);
  var cameraY = camera.distance * Math.sin(rotXRad);
  var cameraZ = camera.distance * Math.cos(rotXRad) * Math.cos(rotYRad);
  var eye = vec3(
    cameraX + camera.translateX,
    cameraY + camera.translateY,
    cameraZ
  );
  var at = vec3(camera.translateX, camera.translateY, 0);
  var up = vec3(0, 1, 0);
  var viewMatrix = lookAt(eye, at, up);

  // ENVIAR VIEW MATRIX
  gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
  gl.uniform3fv(viewPositionLoc, flatten(eye));

  // 3. Luzes (World Space)
  gl.uniform3fv(light1PositionLoc, flatten(light1.position));
  gl.uniform3fv(light1ColorLoc, flatten(light1.color));
  gl.uniform1f(light1IntensityLoc, light1.intensity);

  gl.uniform3fv(light2PositionLoc, flatten(light2.position));
  gl.uniform3fv(light2ColorLoc, flatten(light2.color));
  gl.uniform1f(light2IntensityLoc, light2.intensity);

  gl.useProgram(program);

  // Locations
  var vPosition = gl.getAttribLocation(program, "vPosition");
  var vNormal = gl.getAttribLocation(program, "vNormal");
  var vTexCoord = gl.getAttribLocation(program, "vTexCoord");

  // --- RENDERIZAR OBJETOS ---
  for (var i = 0; i < objects.length; i++) {
    var obj = objects[i];

    // Animações
    var animPosX = 0,
      animPosY = 0,
      animPosZ = 0,
      animScale = 1.0;
    if (animationsEnabled) {
      obj.rotation[0] += obj.animation.rotation[0] * 0.5;
      obj.rotation[1] += obj.animation.rotation[1] * 0.5;
      obj.rotation[2] += obj.animation.rotation[2] * 0.5;
      animPosX = obj.animation.position[0] * Math.sin(time);
      animPosY = obj.animation.position[1] * Math.cos(time);
      animPosZ = obj.animation.position[2] * Math.sin(time * 0.7);
      animScale = 1.0 + obj.animation.scale[0] * 0.1 * Math.sin(time * 2);
    }

    // --- CÁLCULO DA MODEL MATRIX ---
    var modelMatrix = mat4();
    modelMatrix = mult(
      modelMatrix,
      translate(
        obj.position[0] + animPosX,
        obj.position[1] + animPosY,
        obj.position[2] + animPosZ
      )
    );
    modelMatrix = mult(modelMatrix, rotateX(obj.rotation[0]));
    modelMatrix = mult(modelMatrix, rotateY(obj.rotation[1]));
    modelMatrix = mult(modelMatrix, rotateZ(obj.rotation[2]));
    modelMatrix = mult(
      modelMatrix,
      scalem(
        obj.scale[0] * animScale,
        obj.scale[1] * animScale,
        obj.scale[2] * animScale
      )
    );

    // 1. Enviamos a Model Matrix pura
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    // 2. Calculamos a Normal Matrix baseada APENAS na Model Matrix (World Space)
    var normMatrix = normalMatrix(modelMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normMatrix));

    // Uniforms de Material
    gl.uniform3fv(materialAmbientLoc, flatten(obj.material.ambient));
    gl.uniform3fv(materialDiffuseLoc, flatten(obj.material.diffuse));
    gl.uniform3fv(materialSpecularLoc, flatten(obj.material.specular));
    gl.uniform1f(materialShininessLoc, obj.material.shininess);
    gl.uniform1i(isLightLoc, false);

    gl.uniform1i(useTextureLoc, obj.hasTexture);
    if (obj.hasTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uTextureLoc, 0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    gl.drawArrays(gl.TRIANGLES, 0, obj.numVertices);
  }

  // --- RENDERIZAR LUZES ---
  for (var i = 0; i < lights.length; i++) {
    var light = lights[i];
    var lightPos = i === 0 ? light1.position : light2.position;
    var lightCol = i === 0 ? light1.color : light2.color;

    var modelMatrix = mat4();
    modelMatrix = mult(
      modelMatrix,
      translate(lightPos[0], lightPos[1], lightPos[2])
    );

    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    var normMatrix = normalMatrix(modelMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normMatrix));

    gl.uniform1i(isLightLoc, true);
    gl.uniform3fv(materialDiffuseLoc, flatten(lightCol));
    gl.uniform1i(useTextureLoc, false);

    gl.bindBuffer(gl.ARRAY_BUFFER, light.vertexBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, light.normalBuffer);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, light.texCoordBuffer);
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    gl.drawArrays(gl.TRIANGLES, 0, light.numVertices);
  }

  requestAnimFrame(render);
}
