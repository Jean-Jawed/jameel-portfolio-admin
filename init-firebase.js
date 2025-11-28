#!/usr/bin/env node

/**
 * SCRIPT D'INITIALISATION FIREBASE - Jameel Subay Portfolio
 * 
 * Ce script crée les données initiales dans Firestore
 * À exécuter une seule fois pour setup initial
 * 
 * Prérequis:
 * - npm install firebase
 * - Règles Firestore en mode test: allow read, write: if true;
 * 
 * Usage: node init-firebase.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const firebaseConfig = require('./firebase-config');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeFirebase() {
    console.log('🔥 Initialisation de Firebase Jameel Subay...\n');
    
    try {
        // ============================================
        // 1. SETTINGS GLOBAUX
        // ============================================
        console.log('📝 Création des paramètres globaux...');
        await setDoc(doc(db, 'settings', 'global'), {
            photographer: {
                name: 'Jameel Subay',
                tagline: {
                    fr: 'Photographe documentaire',
                    en: 'Documentary Photographer',
                    ar: 'مصور وثائقي'
                },
                email: 'contact@jameelsubay.com',
                phone: '+33 6 51 75 72 47',
                bio_short: {
                    fr: 'Photographe documentaire né au Yémen',
                    en: 'Documentary photographer born in Yemen',
                    ar: 'مصور وثائقي من اليمن'
                },
                bio_long: {
                    fr: 'Jameel Subay est un photographe documentaire né au Yémen. Son travail se concentre sur les questions sociales, les conflits politiques et la diversité culturelle au Moyen-Orient et en Afrique du Nord.\n\nAprès avoir étudié le photojournalisme au Caire, Jameel a commencé à documenter les mouvements du Printemps arabe en 2011. Sa représentation sans concession de la vie quotidienne au milieu des bouleversements politiques lui a rapidement valu une reconnaissance internationale.\n\nLa photographie de Jameel se caractérise par une approche intime qui privilégie la dignité humaine plutôt que le sensationnalisme. Ses projets à long terme explorent souvent des communautés négligées et des dynamiques sociales, remettant en question les récits dominants sur la région.\n\nIl a participé a de nombreuses résidences artistiques et expositions collectives en France, Espagne, Egypte ou au Yémen. Plusieurs revues ont publié ses travaux et il est à l\'origine de nombreuses collaborations.\n\nRésidant désormais à Marseille, Jameel continue de documenter l\'évolution du paysage social et à se réinventer en lien avec les évolutions du monde qui l\'entoure.',
                    en: 'Jameel Subay is a documentary photographer born in Yemen. His work focuses on social issues, political conflicts, and cultural diversity in the Middle East and North Africa.\n\nAfter studying photojournalism in Cairo, Jameel began documenting the Arab Spring movements in 2011. His uncompromising portrayal of daily life amid political upheaval quickly earned him international recognition.\n\nJameel\'s photography is characterized by an intimate approach that prioritizes human dignity over sensationalism. His long-term projects often explore neglected communities and social dynamics, challenging dominant narratives about the region.\n\nHe has participated in numerous artist residencies and group exhibitions in France, Spain, Egypt, and Yemen. Several journals have published his work, and he has initiated numerous collaborations.\n\nNow based in Marseille, Jameel continues to document the evolving social landscape and reinvent himself in connection with the changes in the world around him.',
                    ar: 'جميل صباي مصور وثائقي من اليمن. يركز عمله على القضايا الاجتماعية والصراعات السياسية والتنوع الثقافي في الشرق الأوسط وشمال أفريقيا.'
                },
                profile_image: 'images/Jameel.jpg',
                interview_video_url: 'https://www.youtube.com/embed/8EvMg48Dqko?si=9_b9PilS9njQyV8O',
                social: {
                    instagram: 'https://www.instagram.com/jameelsubay?igsh=b2IwNXp5eTAwNnFl',
                    facebook: '',
                    twitter: ''
                }
            },
            homepage: {
                hero_image: 'images/main.JPG',
                hero_title: {
                    fr: 'Jameel Subay',
                    en: 'Jameel Subay',
                    ar: 'جميل صباي'
                },
                hero_subtitle: {
                    fr: 'Photographe documentaire',
                    en: 'Documentary Photographer',
                    ar: 'مصور وثائقي'
                },
                hero_cta: {
                    fr: 'Voir les galeries',
                    en: 'View galleries',
                    ar: 'عرض المعارض'
                },
                carousel: [
                    {
                        image: 'images/caroussel1.JPG',
                        caption: {
                            fr: 'Documentation du quotidien',
                            en: 'Daily life documentation',
                            ar: 'توثيق الحياة اليومية'
                        }
                    },
                    {
                        image: 'images/caroussel2.JPG',
                        caption: {
                            fr: 'Récits visuels du Moyen-Orient',
                            en: 'Visual stories from the Middle East',
                            ar: 'قصص مرئية من الشرق الأوسط'
                        }
                    },
                    {
                        image: 'images/caroussel3.JPG',
                        caption: {
                            fr: 'Portraits de résilience',
                            en: 'Portraits of resilience',
                            ar: 'صور المرونة'
                        }
                    }
                ],
                featured_galleries: ['corne-de-afrique', 'printemps-arabe', 'minorites-juives']
            },
            contact: {
                intro_text: {
                    fr: 'Pour toute demande professionnelle, collaboration ou simplement pour échanger, n\'hésitez pas à me contacter.',
                    en: 'For any professional inquiry, collaboration, or just to connect, feel free to contact me.',
                    ar: 'لأي استفسار مهني أو تعاون أو مجرد التواصل، لا تتردد في الاتصال بي.'
                },
                formspree_endpoint: 'https://formspree.io/f/mwpbwbaw'
            },
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
        });
        console.log('✅ Paramètres globaux créés\n');

        // ============================================
        // 2. GALERIES
        // ============================================
        console.log('🖼️  Création des galeries...');
        
        const galleries = [
            {
                id: 'corne-de-afrique',
                slug: {
                    fr: 'corne-de-afrique',
                    en: 'horn-of-africa',
                    ar: 'القرن-الأفريقي'
                },
                title: {
                    fr: 'Corne de l\'Afrique',
                    en: 'Horn of Africa',
                    ar: 'القرن الأفريقي'
                },
                description_short: {
                    fr: 'Une exploration photographique des pays de la Corne de l\'Afrique, capturant les paysages et la vie quotidienne.',
                    en: 'A photographic exploration of the Horn of Africa countries, capturing landscapes and daily life.',
                    ar: 'استكشاف فوتوغرافي لدول القرن الأفريقي.'
                },
                description_long: {
                    fr: 'Ce projet documentaire explore les réalités complexes de la Corne de l\'Afrique, une région marquée par des défis humanitaires et des richesses culturelles exceptionnelles. À travers ces images, je cherche à capturer la dignité et la résilience des communautés locales.',
                    en: 'This documentary project explores the complex realities of the Horn of Africa, a region marked by humanitarian challenges and exceptional cultural wealth. Through these images, I seek to capture the dignity and resilience of local communities.',
                    ar: 'يستكشف هذا المشروع الوثائقي الواقع المعقد للقرن الأفريقي.'
                },
                cover_image: 'images/CorneCover.JPG',
                status: 'published',
                order: 1,
                video_url: null,
                map_location: null
            },
            {
                id: 'printemps-arabe',
                slug: {
                    fr: 'printemps-arabe',
                    en: 'arab-spring',
                    ar: 'الربيع-العربي'
                },
                title: {
                    fr: 'Printemps Arabe',
                    en: 'Arab Spring',
                    ar: 'الربيع العربي'
                },
                description_short: {
                    fr: 'Un témoignage visuel des mouvements populaires qui ont marqué le monde arabe à partir de 2010.',
                    en: 'A visual testimony of the popular movements that marked the Arab world from 2010.',
                    ar: 'شهادة بصرية على الحركات الشعبية.'
                },
                description_long: {
                    fr: 'Cette série documente les révolutions arabes de 2011 et leurs conséquences durables. Ces images capturent l\'espoir, la détermination et les sacrifices des peuples qui ont osé rêver d\'un avenir différent.',
                    en: 'This series documents the Arab revolutions of 2011 and their lasting consequences. These images capture the hope, determination, and sacrifices of peoples who dared to dream of a different future.',
                    ar: 'توثق هذه السلسلة الثورات العربية عام 2011.'
                },
                cover_image: 'images/Printemps.JPG',
                status: 'published',
                order: 2,
                video_url: null,
                map_location: null
            },
            {
                id: 'minorites-juives',
                slug: {
                    fr: 'minorites-juives',
                    en: 'jewish-minorities',
                    ar: 'الأقليات-اليهودية'
                },
                title: {
                    fr: 'Minorités juives',
                    en: 'Jewish Minorities',
                    ar: 'الأقليات اليهودية'
                },
                description_short: {
                    fr: 'Un regard intime sur les communautés juives à travers le Moyen-Orient et l\'Afrique du Nord.',
                    en: 'An intimate look at Jewish communities across the Middle East and North Africa.',
                    ar: 'نظرة حميمة على المجتمعات اليهودية.'
                },
                description_long: {
                    fr: 'Ce travail explore l\'histoire et le présent des communautés juives au Moyen-Orient et en Afrique du Nord, témoignant d\'une coexistence millénaire souvent méconnue.',
                    en: 'This work explores the history and present of Jewish communities in the Middle East and North Africa, testifying to a millennial coexistence often unknown.',
                    ar: 'يستكشف هذا العمل تاريخ وحاضر المجتمعات اليهودية.'
                },
                cover_image: 'images/Juives.JPG',
                status: 'published',
                order: 3,
                video_url: null,
                map_location: null
            },
            {
                id: 'marginaux-noirs',
                slug: {
                    fr: 'marginaux-noirs',
                    en: 'black-marginalized',
                    ar: 'المهمشون-السود'
                },
                title: {
                    fr: 'Les Marginaux noirs',
                    en: 'Black Marginalized',
                    ar: 'المهمشون السود'
                },
                description_short: {
                    fr: 'Une exploration visuelle des communautés noires marginalisées dans les sociétés arabes contemporaines.',
                    en: 'A visual exploration of marginalized Black communities in contemporary Arab societies.',
                    ar: 'استكشاف بصري للمجتمعات السوداء المهمشة.'
                },
                description_long: {
                    fr: 'Cette série met en lumière les expériences des communautés afro-arabes, souvent invisibilisées dans le discours dominant sur la région.',
                    en: 'This series highlights the experiences of Afro-Arab communities, often invisible in the dominant discourse about the region.',
                    ar: 'تسلط هذه السلسلة الضوء على تجارب المجتمعات الأفرو-عربية.'
                },
                cover_image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&h=600&fit=crop',
                status: 'published',
                order: 4,
                video_url: null,
                map_location: null
            },
            {
                id: 'houthis-saada',
                slug: {
                    fr: 'houthis-saada',
                    en: 'houthis-saada',
                    ar: 'الحوثيون-صعدة'
                },
                title: {
                    fr: 'Les Houthis à Saada',
                    en: 'Houthis in Saada',
                    ar: 'الحوثيون في صعدة'
                },
                description_short: {
                    fr: 'Un reportage unique au cœur du territoire contrôlé par les Houthis dans le nord du Yémen.',
                    en: 'A unique report from the heart of Houthi-controlled territory in northern Yemen.',
                    ar: 'تقرير فريد من قلب الأراضي التي يسيطر عليها الحوثيون.'
                },
                description_long: {
                    fr: 'Ce reportage est le résultat d\'une immersion dans la région de Saada, bastion du mouvement Houthi dans le nord du Yémen. À travers ces images, je documente la vie quotidienne, les défis humanitaires et les réalités sociales dans une région marquée par le conflit et souvent inaccessible aux médias internationaux.',
                    en: 'This report is the result of an immersion in the Saada region, stronghold of the Houthi movement in northern Yemen. Through these images, I document daily life, humanitarian challenges, and social realities in a region marked by conflict and often inaccessible to international media.',
                    ar: 'هذا التقرير نتيجة انغماس في منطقة صعدة.'
                },
                cover_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
                status: 'published',
                order: 5,
                video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                map_location: {
                    latitude: 16.94157695,
                    longitude: 43.41977235,
                    place_name: {
                        fr: 'Saada, Yémen',
                        en: 'Saada, Yemen',
                        ar: 'صعدة، اليمن'
                    }
                }
            }
        ];

        for (const gallery of galleries) {
            const { id, ...galleryData } = gallery;
            await setDoc(doc(db, 'galleries', id), {
                ...galleryData,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
            });
            console.log(`  ✅ Galerie "${gallery.title.fr}" créée`);
        }

        // ============================================
        // 3. EXPOSITIONS
        // ============================================
        console.log('\n🎨 Création des expositions...');
        
        const exhibitions = [
            {
                id: 'visages-du-yemen',
                type: 'past',
                title: {
                    fr: 'Visages du Yémen',
                    en: 'Faces of Yemen',
                    ar: 'وجوه اليمن'
                },
                location: {
                    fr: 'Institut du Monde Arabe, Paris',
                    en: 'Arab World Institute, Paris',
                    ar: 'معهد العالم العربي، باريس'
                },
                year: '2020',
                date: null,
                description: {
                    fr: 'Une exposition solo présentant des portraits de Yéménites de tous horizons, capturant la diversité humaine et culturelle du pays.',
                    en: 'A solo exhibition presenting portraits of Yemenis from all walks of life, capturing the human and cultural diversity of the country.',
                    ar: 'معرض فردي يقدم صوراً لليمنيين من جميع مناحي الحياة.'
                },
                image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&h=400&fit=crop',
                order: 1
            },
            {
                id: 'arab-spring-decade',
                type: 'past',
                title: {
                    fr: 'Arab Spring: A Decade Later',
                    en: 'Arab Spring: A Decade Later',
                    ar: 'الربيع العربي: بعد عقد من الزمن'
                },
                location: {
                    fr: 'International Center of Photography, New York',
                    en: 'International Center of Photography, New York',
                    ar: 'المركز الدولي للتصوير الفوتوغرافي، نيويورك'
                },
                year: '2021',
                date: null,
                description: {
                    fr: 'Une exposition collective examinant l\'impact à long terme des mouvements du Printemps arabe.',
                    en: 'A collective exhibition examining the long-term impact of the Arab Spring movements.',
                    ar: 'معرض جماعي يفحص التأثير طويل الأمد لحركات الربيع العربي.'
                },
                image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=400&fit=crop',
                order: 2
            },
            {
                id: 'fragments-exil',
                type: 'upcoming',
                title: {
                    fr: 'Fragments d\'Exil',
                    en: 'Fragments of Exile',
                    ar: 'شظايا المنفى'
                },
                location: {
                    fr: 'MUCEM, Marseille',
                    en: 'MUCEM, Marseille',
                    ar: 'متحف حضارات أوروبا والمتوسط، مرسيليا'
                },
                year: '2025',
                date: '2025-06-15',
                description: {
                    fr: 'Une exploration visuelle de l\'expérience des réfugiés yéménites à travers la Méditerranée.',
                    en: 'A visual exploration of the experience of Yemeni refugees across the Mediterranean.',
                    ar: 'استكشاف بصري لتجربة اللاجئين اليمنيين عبر البحر الأبيض المتوسط.'
                },
                image: 'https://images.unsplash.com/photo-1566127992631-326bf6f5e6d7?w=800&h=400&fit=crop',
                order: 1
            }
        ];

        for (const exhibition of exhibitions) {
            const { id, ...exhibitionData } = exhibition;
            await setDoc(doc(db, 'exhibitions', id), {
                ...exhibitionData,
                created_at: serverTimestamp()
            });
            console.log(`  ✅ Exposition "${exhibition.title.fr}" créée`);
        }

        // ============================================
        // 4. PUBLICATIONS
        // ============================================
        console.log('\n📚 Création des publications...');
        
        const publications = [
            {
                id: 'paris-match-2013',
                title: {
                    fr: 'Dans l\'enfer de Haradh - Yémen',
                    en: 'In the hell of Haradh - Yemen',
                    ar: 'في جحيم حرض - اليمن'
                },
                publisher: 'Paris Match',
                year: '2013',
                description: {
                    fr: 'Reportage sur une zone perdue du Yémen où se concentrent tous les trafics.',
                    en: 'Report on a lost zone in Yemen where all kinds of trafficking are concentrated.',
                    ar: 'تقرير عن منطقة مفقودة في اليمن.'
                },
                cover_image: 'images/ParisMatch.png',
                external_url: 'https://www.parismatch.com/Actu/International/Dans-l-enfer-de-Haradh-518828',
                order: 1
            },
            {
                id: 'margins-centers',
                title: {
                    fr: 'Margins and Centers',
                    en: 'Margins and Centers',
                    ar: 'الهوامش والمراكز'
                },
                publisher: 'Phaidon Press',
                year: '2019',
                description: {
                    fr: 'Une collection d\'essais et de photographies explorant le concept de marginalité.',
                    en: 'A collection of essays and photographs exploring the concept of marginality.',
                    ar: 'مجموعة من المقالات والصور.'
                },
                cover_image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop',
                external_url: 'https://phaidon.com',
                order: 2
            },
            {
                id: 'arab-identities',
                title: {
                    fr: 'Arab Identities in Transit',
                    en: 'Arab Identities in Transit',
                    ar: 'الهويات العربية في عبور'
                },
                publisher: 'Thames & Hudson',
                year: '2018',
                description: {
                    fr: 'Un travail collaboratif examinant l\'évolution des identités culturelles.',
                    en: 'A collaborative work examining the evolution of cultural identities.',
                    ar: 'عمل تعاوني يفحص تطور الهويات.'
                },
                cover_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop',
                external_url: 'https://thamesandhudson.com',
                order: 3
            }
        ];

        for (const publication of publications) {
            const { id, ...publicationData } = publication;
            await setDoc(doc(db, 'publications', id), {
                ...publicationData,
                created_at: serverTimestamp()
            });
            console.log(`  ✅ Publication "${publication.title.fr}" créée`);
        }

        // ============================================
        // 5. COLLABORATIONS
        // ============================================
        console.log('\n🤝 Création des collaborations...');
        
        const collaborations = [
            {
                id: 'msf',
                organization: 'Médecins Sans Frontières',
                role: {
                    fr: 'Photographe documentaire',
                    en: 'Documentary Photographer',
                    ar: 'مصور وثائقي'
                },
                description: {
                    fr: 'Une collaboration de longue durée documentant le travail humanitaire de MSF.',
                    en: 'A long-term collaboration documenting MSF\'s humanitarian work.',
                    ar: 'تعاون طويل الأمد لتوثيق العمل الإنساني.'
                },
                logo_image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
                order: 1
            },
            {
                id: 'unesco',
                organization: 'UNESCO World Heritage Centre',
                role: {
                    fr: 'Photographe contributeur',
                    en: 'Contributing Photographer',
                    ar: 'مصور مساهم'
                },
                description: {
                    fr: 'Documentation des sites du patrimoine culturel menacés au Yémen.',
                    en: 'Documentation of endangered cultural heritage sites in Yemen.',
                    ar: 'توثيق مواقع التراث الثقافي المهددة.'
                },
                logo_image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&h=300&fit=crop',
                order: 2
            }
        ];

        for (const collaboration of collaborations) {
            const { id, ...collaborationData } = collaboration;
            await setDoc(doc(db, 'collaborations', id), {
                ...collaborationData,
                created_at: serverTimestamp()
            });
            console.log(`  ✅ Collaboration "${collaboration.organization}" créée`);
        }

        // ============================================
        // RÉSUMÉ
        // ============================================
        console.log('\n🎉 INITIALISATION TERMINÉE !\n');
        console.log('📋 Résumé:');
        console.log(`  - 1 document settings/global`);
        console.log(`  - ${galleries.length} galeries`);
        console.log(`  - ${exhibitions.length} expositions`);
        console.log(`  - ${publications.length} publications`);
        console.log(`  - ${collaborations.length} collaborations`);
        console.log('\n📌 Prochaines étapes :');
        console.log('1. Uploader les images dans Firebase Storage (dossier images/)');
        console.log('2. Créer un utilisateur admin dans Firebase Authentication');
        console.log('3. Changer les règles Firestore en mode sécurisé');
        console.log('4. Développer l\'interface admin\n');
        
    } catch (error) {
        console.error('\n❌ Erreur :', error);
        process.exit(1);
    }
    
    process.exit(0);
}

initializeFirebase();