import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { ArrowLeft } from 'lucide-react';

type CultureConfig = {
  name: string;
  headline: string;
  summary: string;
  heroImage: string;
  experiences: Array<{
    title: string;
    image: string;
    description: string;
    extra?: string[];
  }>;
  keywords: string[];
};

const cultures: Record<string, CultureConfig> = {
  newari: {
    name: 'Newari Heritage Bites',
    headline: 'Kathmandu Valley classics and festival foods',
    summary:
      'Discover the indigenous flavors of the Valley. From spicy choila and bara to sweet yomari, every dish preserves centuries of heritage and communal feasts.',
    heroImage:
      'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    experiences: [
      {
        title: 'Bara & Choila: Savory & Spicy',
        image:
          'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Taste Bara, a savory lentil pancake, often topped with minced meat or egg. It’s a staple at Newari festivals, symbolizing good fortune. Paired with Choila, a spicy grilled meat salad, it offers a dance of textures and flavors—soft, crispy, and fiery.',
      },
      {
        title: 'Yomari: A Sweet Harvest Ritual',
        image:
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Yomari are fish-shaped steamed dumplings filled with molasses and sesame. Made during the post-harvest festival of Yomari Punhi, they are a tribute to the goddess of grains, Annapurna. The sweet, nutty filling is a warm, comforting treat.',
      },
      {
        title: 'Sapu Mhicha: Bone Marrow Delight',
        image:
          'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'A true Newari delicacy, Sapu Mhicha is bone marrow enclosed in a buffalo leaf intestine pouch. When fried, the outer layer becomes crispy while the inside melts. It’s a unique burst of rich, savory flavor, often enjoyed with a glass of local aila (rice spirit).',
      },
      {
        title: 'Aila & Thwon: The Spirits of Newar',
        image:
          'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'No Newari feast is complete without Aila (a potent rice spirit) and Thwon (a milky rice beer). Aila is traditionally poured from a great height to aerate it, a spectacle in itself. These drinks are central to Newari social and religious life.',
      },
    ],
    keywords: [
      'Newari cuisine',
      'Yomari',
      'Bara',
      'Choila',
      'Kathmandu Valley food',
      'Achar tasting',
      'Heritage food walk',
    ],
  },
  sherpa: {
    name: 'Sherpa Mountain Flavors',
    headline: 'High‑altitude hearty dishes from the Himalaya',
    summary:
      'Warm, nourishing plates shaped by altitude and adventure. Taste thukpa, rildok, and yak butter tea in cozy teahouses.',
    heroImage:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    experiences: [
      {
        title: 'Teahouse Soup Crawl',
        image:
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Embark on a warming journey through Himalayan teahouses where thukpa, a hearty noodle soup enriched with vegetables, meat, and aromatic spices, has sustained mountaineers for generations. This Tibetan-origin dish features hand-pulled wheat noodles swimming in a rich bone broth infused with ginger, garlic, and mountain herbs. Thenthuk, its hand-torn noodle cousin, offers a more rustic texture that perfectly captures the essence of high-altitude comfort food. Each sip tells stories of Sherpa hospitality, where these soups serve as both nourishment and social glue in communities living above 3,000 meters. The warming spices help combat the thin mountain air while providing essential calories for trekkers and locals alike.',
      },
      {
        title: 'Butter Tea & Breads',
        image:
          'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Discover the ancient Himalayan tradition of po cha (butter tea), a frothy emulsion of yak butter, tea leaves, and salt that provides essential fats and warmth in extreme altitudes. This pinkish beverage, churned in wooden cylinders called dongmo, offers a unique savory-salty flavor profile that initially surprises but quickly becomes addictive. Paired with tingmo (steamed bread) or balep (flatbread), this combination represents the perfect high-altitude nutrition strategy developed over centuries. The butter provides concentrated calories while the tea offers caffeine and antioxidants, creating a complete meal that sustained traders on the historic Silk Road routes through the Himalayas.',
      },
      {
        title: 'Highland Pantry',
        image:
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Explore the ingenious preservation techniques that allow Sherpa communities to thrive in harsh mountain environments where fresh produce is seasonal. Discover tsampa (roasted barley flour), the staple that fueled Himalayan expeditions, offering a nutty, earthy flavor and incredible nutritional density. Learn about dried yak meat (shakam) and cheese (chhurpi) that provide protein during long winters, and how potatoes, introduced in the 19th century, became a mountain staple. These preserved foods, developed over centuries of isolation, represent a masterclass in sustainable high-altitude living, where every ingredient serves multiple purposes and nothing goes to waste.',
      },
      {
        title: 'Mountain Market Visit',
        image:
          'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Journey through vibrant high-altitude markets where traders brave treacherous mountain passes to deliver essential ingredients to remote Sherpa communities. Witness the fascinating logistics of Himalayan commerce, where yaks and mules carry spices, grains, and vegetables along ancient trade routes. Learn how seasonal availability shapes mountain cuisine, with spring bringing wild garlic and nettles, summer offering fresh herbs, and winter relying on stored provisions. Meet local vendors who have perfected the art of preserving and transporting delicate ingredients through extreme weather, ensuring that even the most isolated teahouses can offer nourishing meals to trekkers and locals alike.',
      },
    ],
    keywords: ['Sherpa cuisine', 'Thukpa', 'Thenthuk', 'Butter tea', 'High‑altitude food'],
  },
  tharu: {
    name: 'Tharu Terai Traditions',
    headline: 'Forest‑foraged and riverland flavors',
    summary:
      'Taste the Terai’s bounty: freshwater fish, wild greens, and rustic preparations rooted in the forest and river.',
    heroImage:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    experiences: [
      {
        title: 'Riverside Fish Fry',
        image:
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Experience the ancient fishing traditions of the Tharu people along the sacred rivers of the Terai plains, where freshwater fish like rohu, naini, and singhi are prepared using techniques passed down through generations. Watch as skilled cooks create the perfect balance of spices—turmeric for earthiness, ginger for warmth, and local chilies for gentle heat—while maintaining the delicate flavor of river-caught fish. Learn how Tharu families have sustainably harvested these waters for centuries, developing unique preparation methods that include smoking, drying, and clay-wrapping techniques. The accompanying condiments, made from foraged herbs like jimbu (Himalayan aromatic herb) and wild coriander, add layers of complexity that reflect the deep connection between the Tharu people and their riverine environment.',
      },
      {
        title: 'Forest Greens Forage',
        image:
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Journey into the Terai\'s verdant forests where Tharu women possess encyclopedic knowledge of over 200 edible wild plants, each with distinct flavors, medicinal properties, and seasonal availability. Discover delicate fiddlehead ferns that emerge with the spring rains, offering a grassy, asparagus-like flavor with subtle nutty undertones. Learn to identify wild amaranth leaves (latte saag) prized for their earthy, slightly peppery taste and exceptional nutritional value. Experience the preparation of bamboo shoots (tama) that require careful processing to remove bitterness while preserving their crisp texture and subtle sweetness. These foraging traditions represent centuries of ecological wisdom, where every plant has its story, season, and specific culinary application that connects the Tharu people to their forest home in profound ways.',
      },
      {
        title: 'Clay Stove Cook‑along',
        image:
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Step into a traditional Tharu kitchen where the earthen chulha (clay stove) becomes the heart of culinary creation, imparting a subtle smokiness that no modern appliance can replicate. Watch as experienced cooks demonstrate the art of temperature control using different types of wood—sal for steady heat, mango for aromatic smoke, and neem for its medicinal properties. Learn how the clay\'s natural minerals enhance the flavor profile of dishes, creating complex layers that define authentic Tharu cuisine. Participate in preparing ghonghi (snail curry) that requires precise timing to achieve its signature tender texture, or bari (lentil patties) that develop their perfect crust only through the clay stove\'s radiant heat. This cooking method, unchanged for millennia, represents the profound connection between Tharu culture and the earth that sustains them.',
      },
      {
        title: 'Market to Meal',
        image:
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Experience the vibrant chaos of a Terai morning market where Tharu women navigate narrow lanes with practiced ease, selecting ingredients based on ancient knowledge passed through generations. Witness the intricate dance of bargaining where prices are negotiated through gestures and smiles rather than words. Learn to identify seasonal specialties like karkalo (taro leaves) that appear only during monsoon, or the perfect ridge gourd with its subtle ridges indicating optimal tenderness. Discover how Tharu cooks read vegetables like others read books—feeling for firmness, smelling for ripeness, and observing color variations that indicate peak flavor. Participate in transforming these fresh market treasures into a traditional lunch featuring machha jhol (fish curry) with river-caught rohu, bhat (rice) grown in nearby paddies, and saag (leafy greens) that were growing in forest clearings just hours earlier.',
      },
    ],
    keywords: ['Tharu cuisine', 'Terai food', 'River fish', 'Wild greens', 'Traditional stoves'],
  },
  tamang: {
    name: 'Tamang Hearth & Homestyle',
    headline: 'Hillside comfort cuisine',
    summary:
      'Homestyle plates built on grains, pulses, and backyard vegetables, seasoned with warmth and community.',
    heroImage:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    experiences: [
      {
        title: 'Village Kitchen Visit',
        image:
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Step into the heart of a Tamang village home where the traditional hearth (agena) serves as both cooking center and social gathering place, embodying centuries of Himalayan hospitality traditions. Observe the intricate process of sel roti preparation, where rice flour batter is poured into hot oil in perfect circular motions using only thumb and forefinger, creating crispy-edged rings with soft, chewy centers. Learn how Tamang women judge oil temperature by the subtle sound changes as batter hits the surface, a skill developed through years of practice. Discover the significance of gundruk (fermented leafy greens) in Tamang cuisine, where mustard, radish, and cauliflower leaves are dried and fermented to create a tangy, probiotic-rich ingredient that adds depth to soups and stews. These kitchen practices represent more than cooking techniques—they embody the Tamang philosophy of food as medicine, community, and spiritual nourishment.',
      },
      {
        title: 'Grains & Pickles',
        image: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Discover the ancient grain wisdom of Tamang cuisine, where millet and buckwheat aren\'t just staples but sacred foods that sustained Himalayan communities through harsh winters and monsoon isolation. Experience the nutty, slightly sweet flavor of kodo (millet) cooked slowly over wood fires until each grain releases its natural oils, creating a satisfying porridge that provides sustained energy for mountain living. Learn the art of buckwheat preparation, where the triangular seeds are stone-ground into flour for dense, nutritious pancakes called phapar roti with earthy undertones and a distinctive purple-gray hue. Explore the world of Tamang achar (pickles) where vegetables are preserved through natural fermentation, creating complex probiotic flavors—crunchy radish pickles infused with timur (Sichuan pepper) that creates a unique tongue-numbing sensation, or fiery tomato chutneys that balance heat, tang, and umami in perfect harmony.',
      },
      {
        title: 'Herbal Tea Break',
        image:
                'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Immerse yourself in the ancient healing traditions of Tamang herbalism, where every leaf, flower, and root serves both culinary and medicinal purposes. Discover the subtle art of timur (Sichuan pepper) tea, where the dried berries release citrusy, pine-like aromas that create a unique tingling sensation on the lips and tongue, believed to aid digestion and circulation. Experience the gentle sweetness of rhododendron flower tea, harvested at specific altitudes where these blooms develop their most concentrated flavors, offering notes of honey and wild berries with a delicate floral finish. Learn about the Tamang understanding of seasonal herbal cycles, where winter calls for warming ginger and cinnamon infusions, while summer demands cooling mint and lemongrass combinations. These teas represent more than refreshment—they embody a holistic approach to wellness that connects the Tamang people to their mountain environment in profound ways.',
      },
      {
        title: 'Courtyard Potluck',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Participate in the heartwarming Tamang tradition of communal dining where every family contributes their specialty dishes, creating a tapestry of flavors that reflects the community\'s collective culinary wisdom. Experience the ceremony of serving, where elders are honored first and portions are distributed according to age and status, maintaining social harmony through food. Discover dishes that appear only at these gatherings—special sel roti variations enriched with jaggery and cardamom, or rare gundruk ko jhol (fermented greens soup) prepared with precise timing to achieve its signature tangy depth. Listen to stories that flow as freely as the local chhyang (rice beer), tales of harvest successes, family milestones, and ancient legends that connect present celebrations to centuries of Tamang heritage. These potlucks represent more than shared meals; they embody the Tamang philosophy that food tastes better when seasoned with community spirit and cultural continuity.',
      },
    ],
    keywords: ['Tamang food', 'Millet dishes', 'Achar', 'Herbal tea', 'Village kitchen'],
  },
  gurung: {
    name: 'Gurung Village Plates',
    headline: 'Highland soups and smoked meats',
    summary:
      'Explore robust soups, smoked meats, and preserved flavors developed for life in the hills.',
    heroImage:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    experiences: [
      {
        title: 'Smoked Pantry',
        image:
          'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Discover the ancient Gurung art of preservation that transforms fresh mountain meats into complex, umami-rich delicacies through time-honored smoking techniques passed down through generations. Witness the meticulous process of sukuti preparation, where lean meat strips are marinated in salt, timur (Sichuan pepper), and local herbs before being slow-smoked over hardwood fires for days, concentrating flavors while developing a deep, smoky complexity. Learn how different woods—rhododendron for subtle floral notes, oak for robust intensity, and pine for aromatic sweetness—impart distinct characteristics to the final product. Experience the transformation of simple ingredients through patience and skill, where months of hanging in mountain air create shakam (dried beef) that rehydrates into tender, intensely flavorful dishes. These preservation methods, born from necessity in remote mountain villages, represent the Gurung mastery of turning seasonal abundance into year-round culinary treasures.',
      },
      {
        title: 'Hearty Soup Stop',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description: 'Immerse yourself in the comforting warmth of traditional Gurung soups, where every spoonful tells a story of mountain resilience and resourcefulness. Discover the subtle complexities of kwati, a nine-bean soup prepared during the Janai Purnima festival, symbolizing renewal and vitality. Each bean contributes a unique texture and flavor—earthy black gram, creamy soybeans, and nutty chickpeas—creating a harmonious blend that is both nourishing and deeply satisfying. Learn how the addition of jimbu, a Himalayan herb foraged from high-altitude pastures, imparts a distinctive onion-garlic aroma that elevates the soup from simple sustenance to a culinary masterpiece. This dish, slow-cooked for hours over a wood fire, embodies the Gurung philosophy of patience and respect for natural ingredients, where time is the most essential spice.',
      },
      {
        title: 'Village Tasting Table',
        image:
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description: 'Gather around a traditional Gurung tasting table where the concept of "food sharing" transcends mere sustenance and becomes a vibrant expression of community, heritage, and social bonding. Experience the ceremonial presentation of dishes, where each item is placed with intention, reflecting its importance in Gurung culture. Sample a diverse array of flavors—from the fiery intensity of timur-infused pickles that awaken the palate, to the subtle sweetness of homemade rice beer (chhyang) that soothes the soul. Learn the unspoken rules of Gurung dining etiquette, where elders are served first and every guest is encouraged to take a second helping as a sign of respect for the host\'s generosity. This communal meal is more than a tasting; it is an immersion into the heart of Gurung hospitality, where every dish tells a story and every shared bite strengthens the bonds of kinship.',
      },
      {
        title: 'Mountain Market',
        image:
          'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80',
        description:
          'Navigate the vibrant chaos of a Gurung mountain market, a sensory explosion where the aromas of freshly ground spices mingle with the earthy scent of high-altitude vegetables and the chatter of traders from distant villages. Learn to distinguish between different varieties of millet, each with its own unique flavor profile and culinary application—from the nutty sweetness of kodo used for porridge, to the robust earthiness of phapar used for pancakes. Discover the secrets of Gurung spice blending, where turmeric, cumin, coriander, and timur are combined in precise ratios to create masalas that form the foundation of their cuisine. Engage with local farmers who possess generations of knowledge about soil, climate, and sustainable farming practices, and learn how their deep connection to the land is reflected in the quality and flavor of their produce. This market visit is not just a shopping trip; it is a deep dive into the agricultural heart of the Gurung community.',
      },
    ],
    keywords: ['Gurung cuisine', 'Smoked meats', 'Highland soup', 'Preserved foods'],
  },
  tibetan: {
    name: 'Tibetan‑Nepali Fusion',
    headline: 'Momos, thenthuk, and butter tea',
    summary:
      'Follow the diaspora’s flavors across noodles, dumplings, and comforting teahouse fare.',
    heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    experiences: [
      {
        title: 'Momo Master Trail',
        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description: 'Embark on a pilgrimage through the heart of Tibetan-Nepali cuisine to master the art of the perfect momo, a deceptively simple dumpling that carries centuries of cultural history in its delicate folds. Discover the subtle differences between steamed momos that preserve the juicy tenderness of the filling, fried momos that offer a satisfyingly crispy exterior, and kothey-style momos that combine the best of both worlds with a pan-fried base and steamed top. Learn how the filling—whether savory minced meat, earthy mushrooms, or creamy paneer—is seasoned with a secret blend of spices that varies from family to family, creating a unique signature taste. The experience culminates in a lesson on chutney making, where you will learn to balance the fiery heat of dalle khursani (Himalayan fire chili) with the tangy sweetness of tomato and the aromatic complexity of cilantro and timur, creating a condiment that elevates the humble momo to a culinary masterpiece.',
        extra: ['Steamed', 'Fried', 'Kothey', 'Chilli'],
      },
      {
        title: 'Thenthuk Noodle House',
        image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Step into a traditional Tibetan noodle house and witness the mesmerizing art of thenthuk preparation, where skilled artisans transform a simple dough of flour and water into rustic, hand-pulled noodles with a satisfyingly chewy texture. The magic lies in the technique: the dough is kneaded, stretched, and flattened before being expertly pulled and torn directly into a simmering broth, ensuring that each noodle absorbs the rich flavors of the soup. The broth itself is a masterpiece of simplicity, a clear and fragrant concoction of bone broth, seasonal vegetables, and tender meat, seasoned with ginger, garlic, and a hint of star anise. This one-bowl meal, born from the nomadic traditions of the Tibetan plateau, is a testament to the beauty of simplicity, where the quality of ingredients and the skill of the maker shine through in every comforting bite.',
      },
      {
        title: 'Butter Tea Stop',
        image:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Immerse yourself in the ancient Tibetan tea ceremony at a traditional teahouse, where the ritual of preparing po cha (butter tea) becomes a meditation on patience, precision, and cultural preservation. Watch as skilled tea masters churn the tea in wooden dongmo cylinders, creating a frothy, pinkish beverage that is both nourishing and spiritually significant. The tea itself is a complex blend of fermented tea leaves, yak butter, and salt, creating a savory, slightly sweet flavor profile that challenges Western palates but quickly becomes addictive. Learn about the cultural significance of this drink, which is served to guests as a sign of respect and consumed by monks during long meditation sessions for its energizing properties. The accompanying breads—tingmo (steamed bread) and balep (flatbread)—provide the perfect vehicle for soaking up the rich, buttery tea, creating a complete meal that has sustained Tibetan communities for centuries.',
      },
      {
        title: 'Neighborhood Fusion Tour',
        image:
          'https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Wander through the vibrant Tibetan neighborhoods of Kathmandu, where the aromas of traditional cuisine mingle with the sounds of prayer wheels and the colorful flutter of prayer flags, creating an immersive cultural experience that engages all the senses. Discover hidden gems where Tibetan refugees have preserved their culinary traditions while adapting to local ingredients and Nepali influences, creating a unique fusion cuisine that tells the story of diaspora and resilience. Learn how momos evolved from simple Tibetan dumplings to become a beloved Nepali street food, or how thukpa transformed from a high-altitude survival food to a comforting urban meal. Meet local cooks who share stories of their journey from Tibet to Nepal, and how food became a way to preserve their identity while building new lives. This neighborhood tour is not just about tasting food; it is about understanding how cuisine becomes a bridge between cultures, a way to honor the past while embracing the future.',
      },
    ],
    keywords: ['Tibetan food', 'Momos', 'Thenthuk', 'Butter tea', 'Fusion'],
  },
  maithil: {
    name: 'Maithil Mithila Feasts',
    headline: "Plains' vegetarian delicacies",
    summary:
      'Vegetable‑forward plates, delicate sweets, and ceremonial foods from the eastern plains.',
    heroImage:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    experiences: [
      {
        title: 'Mithila Sweet Trail',
        image:
          'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Journey through the sacred land of Mithila, where sweets are not merely desserts but edible poetry that celebrates life\'s milestones, from birth to marriage, from harvest to religious festivals. Discover the intricate artistry of thekua, a deep-fried biscuit made from whole wheat flour, jaggery, and coconut, traditionally prepared during the Chhath festival as an offering to the Sun God. Each piece is handcrafted with geometric patterns that tell stories of devotion and gratitude, creating a perfect balance of crispy exterior and soft, sweet interior. Learn the secrets of malpua, a fermented rice pancake soaked in cardamom-scented syrup, where the fermentation process creates complex flavors that dance between tangy and sweet, with hints of tropical fruit from the coconut milk base. Experience the ritual of making anarsa, where rice flour and jaggery are transformed into delicate, moon-shaped sweets that melt on the tongue, leaving behind the warm embrace of cinnamon and the subtle crunch of sesame seeds.',
      },
      {
        title: 'Vegetarian Thali',
        image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80',
        description:
          'Experience the profound philosophy of Maithil vegetarian cuisine, where each dish represents a harmonious balance of the six Ayurvedic tastes—sweet, sour, salty, bitter, pungent, and astringent—creating a complete sensory experience that nourishes both body and soul. Discover the seasonal rhythm of Mithila cooking, where spring brings tender bottle gourd curry (lauki ki sabzi) with cooling properties, summer offers the refreshing tang of raw mango chutney, monsoon introduces warming ginger-lentil soup, autumn celebrates the earthiness of colocasia (arbi) preparation, winter embraces the comfort of spinach and mustard greens, and spring returns with the cleansing bitterness of neem and bitter gourd. Learn the art of tempering (chaunk), where mustard seeds, cumin, and fenugreek are heated in ghee until they release their aromatic oils, creating the flavor foundation that elevates simple vegetables into extraordinary culinary experiences. Each element of the thali is carefully positioned to create visual harmony and taste progression, from the cooling raita that soothes the palate to the fiery pickle that awakens the senses.',
      },
      {
        title: 'Market & Spice Walk',
        image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Navigate the vibrant chaos of a Mithila market, where the air is thick with the intoxicating blend of freshly ground spices, the sweet perfume of ripe mangoes, and the earthy scent of just-harvested vegetables. Learn to distinguish between different varieties of turmeric—Alleppey with its deep orange color and high curcumin content, or Madras with its milder flavor and golden hue—understanding how each type transforms dishes with its distinct color and medicinal properties. Discover the ancient spice routes that brought cardamom, cloves, and cinnamon to this region, and how Maithil cooks have incorporated these exotic flavors into their traditional cuisine. Engage with local vendors who possess encyclopedic knowledge about seasonal availability, quality indicators, and the subtle differences between wild and cultivated varieties. Experience the ritual of spice grinding, where whole spices are transformed into aromatic powders using traditional stone grinders, releasing essential oils that create the complex flavor profiles that define Mithila cuisine.',
      },
      {
        title: 'Courtyard Lunch',
        image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Step into the sacred space of a traditional Mithila courtyard, where the walls are adorned with vibrant Madhubani paintings that tell stories of gods, goddesses, and daily life, creating an artistic backdrop for a meal that is both nourishment and cultural celebration. Experience the ritual of serving, where food is placed on fresh banana leaves that impart a subtle, earthy flavor while maintaining the perfect temperature for each dish. Learn the significance of sitting cross-legged on the floor, a position that aids digestion and creates equality among diners, regardless of social status. Discover the philosophy of eating with hands, where the five fingers represent the five elements—earth, water, fire, air, and space—creating a holistic connection between the diner and the food. Participate in conversations that flow as naturally as the rice beer (handia) served in earthen cups, discussing everything from agricultural cycles to family histories, creating bonds that extend beyond the meal itself.',
      },
    ],
    keywords: ['Maithil food', 'Mithila sweets', 'Vegetarian thali', 'Plains cuisine'],
  },
  thakali: {
    name: 'Thakali Spice Trail',
    headline: 'Legendary dal‑bhat and achars',
    summary:
      'Balanced plates built on lentils, rice, greens, and bright achars that earned nationwide fame.',
    heroImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80',
    experiences: [
      {
        title: 'Dal‑Bhat Masterclass',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Immerse yourself in the ancient wisdom of Thakali cuisine, where the humble dal-bhat transcends mere sustenance to become a complete nutritional philosophy that has sustained Himalayan communities for centuries. Discover the alchemy of transforming simple lentils into a complex, aromatic dal through the precise layering of spices—first the tempering of cumin and mustard seeds in ghee until they release their nutty aroma, then the addition of turmeric for its earthy depth, and finally the subtle heat of dried red chilies. Learn how the rice is not just a neutral base but an active participant in the flavor symphony, its fluffy grains absorbing the dal\'s richness while providing the perfect textural contrast to the accompanying dishes. Experience the ritual of assembly, where each component—whether it\'s the crispy papadum, the cooling raita, or the fiery achar—is positioned with intention, creating a visual and gustatory harmony that reflects the Thakali understanding of balance in all aspects of life.',
      },
      {
        title: 'Achar Bar',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Embark on a sensory journey through the vibrant world of Thakali pickles, where each variety tells a story of preservation, patience, and the alchemical transformation of simple ingredients into complex flavor bombs that elevate every meal from ordinary to extraordinary. Discover the subtle art of balancing the five essential elements—sweet, sour, salty, bitter, and umami—through the careful selection and combination of ingredients, from the fiery heat of green chilies to the tangy brightness of raw mangoes, from the earthy depth of roasted cumin to the floral notes of mustard seeds. Learn how the timing of preparation is as crucial as the ingredients themselves, with summer pickles capturing the sun\'s warmth in their golden hues, while winter varieties develop their complex flavors through slow fermentation in cool, dark cellars. Experience the ritual of tasting, where each pickle is paired with specific dishes to create harmonious flavor combinations that dance on the palate and linger in the memory.',
      },
      {
        title: 'Spice Pantry',
        image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Step into the sacred space of a Thakali spice pantry, where rows of glass jars and brass containers hold the aromatic treasures that transform simple ingredients into culinary masterpieces, each spice carrying centuries of cultural knowledge and medicinal wisdom. Discover the meticulous organization system that separates spices by their primary function—aromatics like cardamom and cloves that perfume dishes, coloring agents like turmeric and saffron that paint plates with golden hues, and heat providers like dried chilies and black pepper that awaken the palate with their fiery kiss. Learn the ancient techniques of spice preparation, from dry-roasting whole spices to release their essential oils to grinding them in traditional stone mortars that preserve their volatile compounds better than modern appliances. Experience the sensory education of identifying spices through sight, smell, and touch, understanding how the quality of a spice can be determined by its color intensity, aromatic complexity, and textural characteristics.',
      },
      {
        title: 'Homestyle Lunch',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description:
          'Enter the warm embrace of a traditional Thakali family kitchen, where three generations gather around the hearth to prepare a meal that is both daily sustenance and living heritage, each dish carrying the flavors of ancestors and the innovations of modern cooks. Experience the rhythm of family cooking, where tasks are divided by expertise and tradition—the grandmother who knows exactly when the dal has reached its perfect consistency, the mother who can judge the rice\'s doneness by its aroma alone, and the daughter who brings fresh perspectives to classic preparations. Learn the subtle differences between restaurant and home-style cooking, where the absence of commercial pressure allows for longer cooking times that develop deeper flavors, more generous use of ghee that creates richer textures, and the freedom to adjust seasonings based on personal preferences rather than standardized recipes. Participate in conversations that flow as naturally as the cooking process, discussing everything from agricultural cycles to family histories, creating bonds that extend beyond the meal itself.',
      },
    ],
    keywords: ['Thakali food', 'Dal bhat', 'Achar', 'Spices'],
  },
};

const FoodTourCulturePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const c = slug && cultures[slug] ? cultures[slug] : undefined;

  if (!c) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Culture not found</h1>
          <button
            onClick={() => navigate('/food-tours')}
            className="px-6 py-3 bg-brand-yellow hover:bg-[#E5A800] text-slate-900 font-bold rounded-full transition-all"
          >
            Back to Food Tours
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="relative min-h-[70vh] flex items-center">
        {/* Full-bleed background image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('${c.heroImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>

        {/* Navigation button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-4 z-20 flex items-center gap-2 text-white hover:text-brand-yellow font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="container mx-auto px-4 relative z-10 py-20 md:py-24">
          {/* Left-aligned content */}
          <div className="max-w-2xl text-left space-y-6">
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></span>
                {c.name.split(' ')[0]} • {c.headline.split(' ')[0]}
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-white/90 border border-gray-200 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                Heritage-led tastings
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {c.name}
            </h1>

            <p className="text-xl text-white/90 max-w-xl leading-relaxed">{c.headline}</p>
            <p className="text-white/80 max-w-xl">{c.summary}</p>

            <div className="flex flex-wrap gap-3">
              {c.keywords.slice(0, 5).map((k) => (
                <span key={k} className="px-4 py-2 bg-white/20 border border-white/30 rounded-full text-sm text-white backdrop-blur-sm">
                  {k}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 bg-brand-yellow hover:bg-[#E5A800] text-slate-900 font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Explore experiences
              </button>
              <button
                onClick={() => navigate('/food-tours')}
                className="px-8 py-3.5 bg-white/90 hover:bg-white text-[#213448] font-bold rounded-full transition-all shadow-sm border border-white/50"
              >
                Back to Food Tours
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Experiences Section */}
      <main id="experiences" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Food to Taste in {c.name.split(' ')[0]}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              A curated selection of must-try dishes and culinary traditions that define the region's unique food culture.
            </p>
          </div>
          <div className="space-y-16">
            {c.experiences.map((exp, index) => (
              <div
                key={exp.title}
                className={`group flex flex-col md:flex-row items-center gap-8 md:gap-12 ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="md:w-1/2 overflow-hidden rounded-2xl shadow-xl">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{exp.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{exp.description}</p>
                  {exp.extra && (
                    <div className="mt-6">
                      <h4 className="font-bold text-gray-800 mb-3">Popular Varieties</h4>
                      <div className="flex flex-wrap gap-3">
                        {exp.extra.map((item) => (
                          <span key={item} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FoodTourCulturePage;
