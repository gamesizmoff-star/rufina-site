document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('lotus-3d-container');
    if (!container) return;

    // Включаем рендерер и настраиваем канвас, добавляя поддержку прозрачности
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    const updateSize = () => {
        const width = container.clientWidth || 300;
        const height = container.clientHeight || 300;
        renderer.setSize(width, height);
        if (camera) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    };
    container.appendChild(renderer.domElement);

    // Сцена
    const scene = new THREE.Scene();

    // Камера
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    // Освещение (Золотая палитра и Фиолетовый оттенок)
    const ambientLight = new THREE.AmbientLight(0xfff0f5, 0.7); // Лавандовый оттенок
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xd4af37, 2, 50);
    goldLight.position.set(5, 5, 5);
    scene.add(goldLight);

    const purpleLight = new THREE.PointLight(0x8a2be2, 1.5, 50);
    purpleLight.position.set(-5, 5, -5);
    scene.add(purpleLight);

    // Лотос как группа
    const lotus = new THREE.Group();
    scene.add(lotus);

    // Материал для лепестков
    const petalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xd4af37,       // Золотой
        emissive: 0x331100,
        roughness: 0.1,
        metalness: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
    });

    // Геометрия лепестка (вытянутая сфера, немного изогнутая)
    const petalGeometry = new THREE.SphereGeometry(1, 32, 16);
    // Деформируем геометрию, чтобы сделать похожим на лепесток лотоса
    const positionAttribute = petalGeometry.attributes.position;
    for (let i = 0; i < positionAttribute.count; i++) {
        let x = positionAttribute.getX(i);
        let y = positionAttribute.getY(i);
        let z = positionAttribute.getZ(i);
        
        // Сплющиваем по Z и вытягиваем по Y
        z *= 0.1;
        
        // Слегка изгибаем кончик наружу
        if (y > 0) {
            z -= Math.pow(y, 2) * 0.15;
            x *= (1 - y * 0.2); // Сужение к верху
        } else {
            x *= (1 + y * 0.5); // Сужение к низу
        }
        
        positionAttribute.setXYZ(i, x, y * 3.0, z);
    }
    petalGeometry.computeVertexNormals();

    // Функция создания кольца лепестков
    const createPetalRing = (count, radius, tilt, scaleY, yOffset) => {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            
            // Расставляем по кругу
            petal.position.x = Math.cos(angle) * radius;
            petal.position.z = Math.sin(angle) * radius;
            petal.position.y = yOffset;

            // Поворачиваем лепесток
            petal.rotation.y = -angle + Math.PI / 2; // Лицом от центра
            petal.rotation.x = tilt; // Наклон наружу
            
            petal.scale.set(1, scaleY, 1);
            
            lotus.add(petal);
        }
    };

    // Создаем слои лотоса
    createPetalRing(8,  0.3, -0.2, 0.8,  0.5); // Внутренний
    createPetalRing(12, 0.8, -0.5, 1.2,  0.2); // Средний
    createPetalRing(16, 1.5, -0.8, 1.5, -0.2); // Внешний 1
    createPetalRing(20, 2.2, -1.1, 1.6, -0.7); // Внешний 2

    // Центр лотоса (сердцевина)
    const centerGeo = new THREE.CylinderGeometry(0.8, 0.5, 0.5, 32);
    const centerMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.6,
        metalness: 0.1
    });
    const center = new THREE.Mesh(centerGeo, centerMat);
    center.position.y = 0;
    lotus.add(center);

    // Добавляем свечение в центре (Sprite или PointLight)
    const centerLight = new THREE.PointLight(0xffaa00, 1, 5);
    centerLight.position.y = 1;
    lotus.add(centerLight);

    // Анимация
    lotus.position.y = -1; // Смещаем чуть вниз
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        
        // Плавное вращение и дыхание
        lotus.rotation.y = elapsedTime * 0.5;
        lotus.position.y = -1 + Math.sin(elapsedTime * 2) * 0.2;
        
        // Внутреннее дышащее свечение
        centerLight.intensity = 1 + Math.sin(elapsedTime * 3) * 0.5;

        renderer.render(scene, camera);
    };

    updateSize();
    // Даем небольшую задержку, чтобы стили успели примениться
    setTimeout(updateSize, 100);
    window.addEventListener('resize', updateSize);
    animate();
});
