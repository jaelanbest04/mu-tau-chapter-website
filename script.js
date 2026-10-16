const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => nav.classList.toggle('open'));
}


// Dynamic YouTube latest video card
// To make this live, add a YouTube Data API v3 key below.
const YOUTUBE_API_KEY = ""; // Paste API key here
const YOUTUBE_CHANNEL_ID = "UC3jGpwatpzn22aePaarNRtw";
const FALLBACK_VIDEO_ID = "gNIank6NVRU";

function updateYouTubeCard(video) {
  const titleEl = document.getElementById("yt-video-title");
  const descEl = document.getElementById("yt-video-description");
  const thumbEl = document.getElementById("yt-video-thumbnail");
  const linkEl = document.getElementById("yt-video-link");
  const buttonEl = document.getElementById("yt-video-button");

  if (!titleEl || !descEl || !thumbEl || !linkEl || !buttonEl) return;

  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
  titleEl.textContent = video.title;
  descEl.textContent = video.description || "Watch the latest from the Mu Tau Chapter.";
  thumbEl.src = video.thumbnail;
  thumbEl.alt = video.title;
  linkEl.href = videoUrl;
  buttonEl.href = videoUrl;
}

async function loadLatestYouTubeVideo() {
  const fallback = {
    id: FALLBACK_VIDEO_ID,
    title: "Featured Mu Tau Chapter Video",
    description: "Click the preview to watch directly on YouTube.",
    thumbnail: `https://img.youtube.com/vi/${FALLBACK_VIDEO_ID}/hqdefault.jpg`
  };

  if (!YOUTUBE_API_KEY) {
    updateYouTubeCard(fallback);
    return;
  }

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=1&type=video`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!data.items || !data.items.length) {
      updateYouTubeCard(fallback);
      return;
    }

    const item = data.items[0];
    updateYouTubeCard({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg`
    });
  } catch (error) {
    updateYouTubeCard(fallback);
  }
}

loadLatestYouTubeVideo();


// Homepage hero slideshow
const slides = document.querySelectorAll('.hero-slideshow .slide');
const dots = document.querySelectorAll('.hero-slideshow .dot');
const prevSlide = document.querySelector('.prev-slide');
const nextSlide = document.querySelector('.next-slide');
let currentSlide = 0;
let slideTimer;

function showSlide(index) {
  if (!slides.length) return;
  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === currentSlide);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function startSlideshow() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => showSlide(currentSlide + 1), 5000);
}

if (slides.length) {
  nextSlide?.addEventListener('click', () => {
    showSlide(currentSlide + 1);
    startSlideshow();
  });

  prevSlide?.addEventListener('click', () => {
    showSlide(currentSlide - 1);
    startSlideshow();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      startSlideshow();
    });
  });

  startSlideshow();
}


// YouTube cards: pull title from YouTube oEmbed and keep thumbnails matched to each video ID.
async function loadYouTubeCardTitles() {
  const cards = document.querySelectorAll(".youtube-card[data-video-id]");

  cards.forEach(async (card) => {
    const videoId = card.dataset.videoId;
    const titleEl = card.querySelector("h3");
    const imgEl = card.querySelector("img");
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    card.href = videoUrl;
    if (imgEl) {
      imgEl.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
      if (!res.ok) throw new Error("Title fetch failed");
      const data = await res.json();

      if (titleEl && data.title) {
        titleEl.textContent = data.title;
      }
      if (imgEl && data.title) {
        imgEl.alt = `${data.title} thumbnail`;
      }
    } catch (error) {
      if (titleEl) {
        titleEl.textContent = "Mu Tau Chapter Video";
      }
    }
  });
}

loadYouTubeCardTitles();


// Leadership / Scholarship / Service pillar slideshows
document.querySelectorAll('.pillar-slideshow').forEach((slideshow) => {
  const pillarSlides = slideshow.querySelectorAll('.pillar-slide');
  let pillarIndex = 0;

  if (!pillarSlides.length) return;

  setInterval(() => {
    pillarSlides[pillarIndex].classList.remove('active');
    pillarIndex = (pillarIndex + 1) % pillarSlides.length;
    pillarSlides[pillarIndex].classList.add('active');
  }, 4500);
});
document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelectorAll("#lineage-list li");

  let counter = 1;

  list.forEach(li => {
    // prevent double-numbering
    if (li.dataset.processed === "true") return;

    const override = li.getAttribute("data-num");

    let numberText;

    if (override) {
      numberText = override.replace(",", " | ");
    } else {
      numberText = counter;
      counter++;
    }

    // clean original text once
    const original = li.textContent.trim();

    li.textContent = `${numberText} ${original}`;
    li.dataset.processed = "true";
  });
});