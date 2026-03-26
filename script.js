document.addEventListener('DOMContentLoaded', function () {
    const block1 = document.querySelector('.block-info1');
    if (block1) {
        const startPosition1 = -332;
        const offset1 = 332;
        block1.addEventListener('mouseenter', () => {
            block1.style.left = (startPosition1 + offset1) + 'px';
        });
        block1.addEventListener('mouseleave', () => {
            block1.style.left = startPosition1 + 'px';
        });
    }

    const block2 = document.querySelector('.block-info2');
    if (block2) {
        const startPosition2 = 858;
        const offset2 = -300;
        block2.addEventListener('mouseenter', () => {
            block2.style.left = (startPosition2 + offset2) + 'px';
        });
        block2.addEventListener('mouseleave', () => {
            block2.style.left = startPosition2 + 'px';
        });
    }

    const block3 = document.querySelector('.block-info3');
    if (block3) {
        const startPosition3 = -423;
        const offset3 = 430;
        block3.addEventListener('mouseenter', () => {
            block3.style.left = (startPosition3 + offset3) + 'px';
        });
        block3.addEventListener('mouseleave', () => {
            block3.style.left = startPosition3 + 'px';
        });
    }

    function setupPointClick(pointSelector, targetSelector) {
        const point = document.querySelector(pointSelector);
        const target = document.querySelector(targetSelector);
        if (point && target) {
            point.style.cursor = 'pointer';
            point.addEventListener('click', () => {
                target.classList.toggle('screen-hidden');
            });
        }
    }
    setupPointClick('.point1', '.screen2');
    setupPointClick('.point2', '.screen4');
    setupPointClick('.point3', '.screen6');

    const setupHover = (selector, start, offset) => {
        const el = document.querySelector(selector);
        if (el) {
            el.addEventListener('mouseenter', () => el.style.left = (start + offset) + 'px');
            el.addEventListener('mouseleave', () => el.style.left = start + 'px');
        }
    };
    setupHover('.block-info1', -332, 332);
    setupHover('.block-info2', 858, -300);
    setupHover('.block-info3', -423, 430);

    const dragArea = document.querySelector('.tire-drag-element');
    const machine = document.querySelector('.machine');
    const counterDisplay = document.getElementById('counter');
    const trackContainer = document.getElementById('trackContainer');
    let count = 0;
    if (dragArea) {
        dragArea.addEventListener('dragstart', (e) => {
            if (e.dataTransfer.setDragImage) {
                e.dataTransfer.setDragImage(emptyImage, 0, 0);
            }
            e.dataTransfer.setData('text/plain', 'tire');
        });
    }
    if (machine) {
        machine.addEventListener('dragover', (e) => {
            e.preventDefault();
            machine.style.transform = 'scale(1.05)';
        });
        machine.addEventListener('dragleave', () => {
            machine.style.transform = 'scale(1)';
        });
        machine.addEventListener('drop', (e) => {
            e.preventDefault();
            machine.style.transform = 'scale(1)';
            count++;
            if (counterDisplay) counterDisplay.textContent = count;
            if (count % 12 === 0) {
                if (trackContainer) {
                    trackContainer.innerHTML = '';
                }
                createHeart();
            } else {
                const segment = document.createElement('div');
                segment.classList.add('track-segment');
                if (trackContainer) {
                    trackContainer.insertBefore(segment, trackContainer.firstChild);
                }
            }
        });

        function createHeart() {
            const screen4 = document.querySelector('.screen4');
            if (!screen4) return;
            const heart = document.createElement('div');
            heart.classList.add('mini-heart');
            heart.innerHTML = '❤';
            const x = Math.random() * (screen4.offsetWidth - 50);
            const y = Math.random() * (screen4.offsetHeight - 50);
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';
            screen4.prepend(heart);
        }
    }

    initBottlePhysics();
    function initBottlePhysics() {
        const physicsContainer = document.getElementById('physics-container');
        if (!physicsContainer) return;
        if (typeof Matter === 'undefined') return;
        const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;
        const engine = Engine.create();
        const width = 1280;
        const height = 754;
        const render = Render.create({
            element: physicsContainer,
            engine: engine,
            options: {
                width: width,
                height: height,
                wireframes: false,
                background: 'transparent'
            }
        });
        const ground = Bodies.rectangle(640, 740, 1280, 40, { isStatic: true, render: { visible: false } });
        const leftWall = Bodies.rectangle(-10, 377, 20, 754, { isStatic: true, render: { visible: false } });
        const rightWall = Bodies.rectangle(1290, 377, 20, 754, { isStatic: true, render: { visible: false } });
        Composite.add(engine.world, [ground, leftWall, rightWall]);

        const bottleCount = 30;
        let remainingBottles = bottleCount;
        for (let i = 0; i < bottleCount; i++) {
            const x = Math.random() * (width - 100) + 50;
            const y = Math.random() * -2000 - 50;
            const bottle = Bodies.rectangle(x, y, 40, 80, {
                restitution: 0.5,
                friction: 0.1,
                label: 'bottle',
                angle: Math.random() * Math.PI,
                render: {
                    sprite: {
                        texture: 'assets/img/bottle.png',
                        xScale: 0.1,
                        yScale: 0.1
                    }
                }
            });
            Composite.add(engine.world, bottle);
        }

        const mouse = Mouse.create(render.canvas);
        mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
        mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        Composite.add(engine.world, mouseConstraint);

        function spawnBasketball() {
            const ball = Bodies.circle(width / 2, -100, 45, {
                restitution: 1,
                friction: 0.05,
                label: 'basketball',
                render: {
                    sprite: {
                        texture: 'assets/img/ball.png',
                        xScale: 0.2,
                        yScale: 0.2
                    }
                }
            });
            Composite.add(engine.world, ball);
        }

        Events.on(mouseConstraint, "mousedown", function (event) {
            const body = event.source.body;
            if (body && body.label === 'bottle') {
                Composite.remove(engine.world, body);
                remainingBottles--;
                if (remainingBottles === 0) {
                    spawnBasketball();
                }
            }
        });
        render.mouse = mouse;
        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);
    }

    init3DScene();
    function init3DScene() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1280 / 500, 0.1, 1000);
        camera.position.set(0, 0, 3);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        const drawingCanvas = document.createElement('canvas');
        drawingCanvas.width = 1024;
        drawingCanvas.height = 1024;
        const ctx = drawingCanvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        const paintTexture = new THREE.CanvasTexture(drawingCanvas);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const loader = new THREE.GLTFLoader();
        loader.load('assets/model/scene.gltf', (gltf) => {
            modelMesh = gltf.scene;
            modelMesh.scale.set(3, 3, 3);
            modelMesh.position.set(0, -1, -1.5);
            modelMesh.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        map: paintTexture,
                        color: 0x666666,
                        metalness: 0.1,
                        roughness: 0.8
                    });
                }
            });
            scene.add(modelMesh);
        }, undefined, (error) => {
            console.error("Ошибка загрузки:", error);
        });

        let isDrawing = false;
        let isRightMouseDown = false;
        let prevMousePosition = { x: 0, y: 0 };
        let currentColor = '#F44236';
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function draw(event) {
            if (!modelMesh) return;
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(modelMesh.children, true);
            if (intersects.length > 0) {
                const uv = intersects[0].uv;
                if (uv) {
                    ctx.fillStyle = currentColor;
                    ctx.beginPath();
                    ctx.arc(uv.x * 1024, (1 - uv.y) * 1024, 15, 0, Math.PI * 2);
                    ctx.fill();
                    paintTexture.needsUpdate = true;
                }
            }
        }

        document.querySelectorAll('.color-tool').forEach(tool => {
            tool.addEventListener('click', (e) => {
                currentColor = e.target.dataset.color;
            });
        });
        container.addEventListener('contextmenu', (e) => e.preventDefault());
        container.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                isDrawing = true;
            } else if (e.button === 2) {
                isRightMouseDown = true;
                prevMousePosition = { x: e.clientX, y: e.clientY };
            }
        });
        window.addEventListener('mouseup', () => {
            isDrawing = false;
            isRightMouseDown = false;
        });

        container.addEventListener('mousemove', (e) => {
            if (isDrawing) {
                draw(e);
            } else if (isRightMouseDown && modelMesh) {
                const deltaMove = {
                    x: e.clientX - prevMousePosition.x,
                    y: e.clientY - prevMousePosition.y
                };
                const sensitivity = 0.007;
                modelMesh.rotation.y += deltaMove.x * sensitivity;
                modelMesh.rotation.x += deltaMove.y * sensitivity;
                prevMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
    }
});