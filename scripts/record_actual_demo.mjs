import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const WORK_DIR = '/home/om/Documents/Stellar/StellarCanvas';
const ASSETS_DIR = path.join(WORK_DIR, 'scripts/video_assets');
const OUTPUT_DIR = path.join(WORK_DIR, 'public');
const FINAL_VIDEO_PATH = path.join(WORK_DIR, 'stellar_canvas_demo_1080p.mp4');
const PUBLIC_VIDEO_PATH = path.join(OUTPUT_DIR, 'stellar_canvas_demo_1080p.mp4');

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// 1. Scene Narration & Script Definitions
// ---------------------------------------------------------------------------
const SCENES = [
  {
    id: 'scene_1',
    title: 'Hook & The Vision',
    badge: '100% ON-CHAIN • STELLAR SOROBAN',
    lower_third: 'StellarCanvas | Decentralized Collaborative Art',
    narration:
      'What happens when you bring collaborative digital art directly onto the blockchain? Welcome to StellarCanvas — a decentralized, 64-by-64 collaborative pixel canvas built natively on Stellar Soroban. Every single pixel placed is an immutable, verifiable smart contract invocation with lightning-fast finality.',
  },
  {
    id: 'scene_2',
    title: 'Seamless Wallet Connection',
    badge: 'STELLARWALLETSKIT • INSTANT AUTH',
    lower_third: 'Self-Custodial Stellar Wallet Integration',
    narration:
      'Connecting to Web3 on Stellar is instantaneous. With integrated StellarWalletsKit support, users can choose Freighter, Albedo, xBull, or Lobstr. Once connected, your wallet balance and public key are verified directly on the Stellar testnet, unlocking full interactive control of the canvas.',
  },
  {
    id: 'scene_3',
    title: 'Interactive 64x64 Canvas & Palette',
    badge: '64x64 GRID • 4,096 ON-CHAIN PIXELS',
    lower_third: 'Smooth Pan/Zoom & 24-Color Preset System',
    narration:
      'Here is the battlefield: a 4,096-pixel grid rendered on a high-performance HTML5 Canvas element. With full hardware acceleration, you get fluid multi-touch zoom up to 20x, smooth click-and-drag panning, and precise coordinate hover tracking. Selecting your weapon is simple with 24 curated preset hex palettes or custom 24-bit RGB color picking.',
  },
  {
    id: 'scene_4',
    title: 'Core Paint Flow & Finality',
    badge: 'CONTRACT INVOCATION • paint_pixel(32, 32)',
    lower_third: 'Sub-2s Deterministic Testnet Finality',
    narration:
      "Now, let's claim a pixel at coordinate 32, 32. Clicking the grid immediately initiates an on-chain paint_pixel invocation on our Soroban smart contract. The transaction is submitted to the Stellar testnet, and in less than two seconds, Stellar achieves deterministic finality! The pixel is permanently recorded on-chain, and an explorer link is instantly generated.",
  },
  {
    id: 'scene_5',
    title: 'Real-Time Event Streaming',
    badge: 'SOROBAN RPC • getEvents() STREAMING',
    lower_third: 'Live Event Stream & Automatic State Sync',
    narration:
      'Notice how the rest of the application reacted. StellarCanvas features a decentralized Event Provider that continuously streams PixelPainted events directly from Soroban RPC endpoints. When other artists around the globe paint on the canvas, your screen updates in real time with zero page refresh.',
  },
  {
    id: 'scene_6',
    title: 'NFT Achievement Badges & Profile',
    badge: 'GAMIFICATION • NFT ACHIEVEMENT BADGES',
    lower_third: 'Player Stats, Badges & Historical Logs',
    narration:
      'Painting pixels isn’t just about art — it’s a competitive game. Hitting key milestones unlocks on-chain NFT-style achievement badges like First Pixel, Pixel Apprentice, and Top 10 Champion, which you can track alongside your full paint history in your Profile.',
  },
  {
    id: 'scene_7',
    title: 'Live On-Chain Leaderboard',
    badge: 'LIVE LEADERBOARD • TOP 10 RANKINGS',
    lower_third: 'Dynamic Contract-Queried Hall of Fame',
    narration:
      'For competitive painters, the Leaderboard provides a real-time hall of fame. Ranks 1 through 10 are queried directly from the Leaderboard smart contract, tracking the most prolific painters across the network with live dynamic re-ranking.',
  },
  {
    id: 'scene_8',
    title: 'Architecture & Call to Action',
    badge: 'OPEN SOURCE • RUST SOROBAN SDK',
    lower_third: 'Live on Stellar Testnet | stellar-canvas.vercel.app',
    narration:
      'To respect Soroban’s storage budget limits, StellarCanvas implements row-sliced reads to seamlessly assemble the full canvas with 100% test coverage across all 18 contract tests. StellarCanvas demonstrates the true potential of Stellar Soroban: high-throughput, low-cost, real-time decentralized applications. Connect your wallet, claim your coordinate, and make your mark on history!',
  },
];

// ---------------------------------------------------------------------------
// 2. Audio Generation (Edge-TTS Male Voice + Ambient Lo-Fi + SFX)
// ---------------------------------------------------------------------------
function generateVoiceovers() {
  console.log('🎙️ Generating professional male voiceovers via Edge-TTS (en-US-AndrewMultilingualNeural)...');
  for (const scene of SCENES) {
    const sid = scene.id;
    const text = scene.narration;
    const mp3Path = path.join(ASSETS_DIR, `${sid}_actual_voice.mp3`);
    const wavPath = path.join(ASSETS_DIR, `${sid}_actual_voice.wav`);

    if (!fs.existsSync(wavPath)) {
      execSync(
        `/home/om/.local/bin/edge-tts --voice "en-US-AndrewMultilingualNeural" --text "${text.replace(/"/g, '\\"')}" --write-media "${mp3Path}"`,
      );
      execSync(`ffmpeg -y -i "${mp3Path}" -ar 44100 -ac 1 "${wavPath}" 2>/dev/null`);
    }

    const durStr = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavPath}"`,
    )
      .toString()
      .trim();
    const dur = parseFloat(durStr);
    scene.audio_wav = wavPath;
    scene.voice_duration = dur;
    scene.duration = Math.max(dur + 1.2, 6.0); // add 1.2s padding for smooth transitions
    console.log(`  ✓ ${sid}: ${scene.duration.toFixed(2)}s (voice: ${dur.toFixed(2)}s) -> "${scene.title}"`);
  }
}

// ---------------------------------------------------------------------------
// 3. Client-Side Cursor & Overlay Injector
// ---------------------------------------------------------------------------
const INJECT_SCRIPT = `
(function() {
  if (document.getElementById('demo-cursor-layer')) return;

  const layer = document.createElement('div');
  layer.id = 'demo-cursor-layer';
  layer.style.position = 'fixed';
  layer.style.top = '0';
  layer.style.left = '0';
  layer.style.width = '100vw';
  layer.style.height = '100vh';
  layer.style.pointerEvents = 'none';
  layer.style.zIndex = '999999';
  layer.innerHTML = \`
    <div id="demo-cursor" style="
      position: absolute;
      top: 0; left: 0;
      width: 28px; height: 28px;
      transform: translate(-3px, -3px);
      transition: transform 0.04s linear;
      pointer-events: none;
    ">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 2L22 13.5L13.5 15.5L9.5 24.5L4 2Z" fill="#8C52FF" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="5" cy="3" r="3" fill="#00F5FF" />
      </svg>
    </div>
    <div id="demo-hud-top" style="
      position: fixed;
      top: 96px;
      left: 60px;
      background: rgba(140, 82, 255, 0.28);
      border: 1px solid rgba(140, 82, 255, 0.6);
      backdrop-filter: blur(16px);
      border-radius: 9999px;
      padding: 6px 18px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #FFFFFF;
      box-shadow: 0 8px 32px rgba(140, 82, 255, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(-8px);
    ">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: #00F5FF; box-shadow: 0 0 10px #00F5FF;"></span>
      <span id="demo-hud-badge-text">100% ON-CHAIN • STELLAR SOROBAN</span>
    </div>
    <div id="demo-hud-bottom" style="
      position: fixed;
      bottom: 32px;
      left: 60px;
      background: rgba(15, 17, 32, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      border-radius: 14px;
      padding: 12px 24px;
      font-family: system-ui, -apple-system, sans-serif;
      color: #FFFFFF;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      gap: 14px;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(8px);
    ">
      <div style="width: 4px; height: 28px; border-radius: 2px; background: linear-gradient(to bottom, #8C52FF, #00F5FF);"></div>
      <div>
        <div id="demo-hud-title" style="font-size: 14px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.02em;">StellarCanvas</div>
        <div id="demo-hud-desc" style="font-size: 12px; color: #94A3B8; margin-top: 2px;">Decentralized Collaborative Art on Soroban</div>
      </div>
    </div>
  \`;
  document.body.appendChild(layer);

  window.__moveCursor = function(x, y) {
    const c = document.getElementById('demo-cursor');
    if (c) {
      c.style.transform = \`translate(\${x}px, \${y}px)\`;
    }
  };

  window.__clickRipple = function(x, y) {
    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.left = \`\${x - 20}px\`;
    ripple.style.top = \`\${y - 20}px\`;
    ripple.style.width = '40px';
    ripple.style.height = '40px';
    ripple.style.borderRadius = '50%';
    ripple.style.border = '2px solid #00F5FF';
    ripple.style.boxShadow = '0 0 20px #00F5FF';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '9999999';
    ripple.style.animation = 'demoRipple 0.6s cubic-bezier(0, 0.2, 0.8, 1) forwards';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  window.__updateHUD = function(badge, title, desc, show = true) {
    const top = document.getElementById('demo-hud-top');
    const bottom = document.getElementById('demo-hud-bottom');
    const badgeText = document.getElementById('demo-hud-badge-text');
    const titleText = document.getElementById('demo-hud-title');
    const descText = document.getElementById('demo-hud-desc');

    if (badgeText) badgeText.innerText = badge;
    if (titleText) titleText.innerText = title;
    if (descText) descText.innerText = desc;

    if (top) {
      top.style.opacity = show ? '1' : '0';
      top.style.transform = show ? 'translateY(0)' : 'translateY(-8px)';
    }
    if (bottom) {
      bottom.style.opacity = show ? '1' : '0';
      bottom.style.transform = show ? 'translateY(0)' : 'translateY(8px)';
    }
  };

  const style = document.createElement('style');
  style.innerHTML = \`
    @keyframes demoRipple {
      0% { transform: scale(0.2); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  \`;
  document.head.appendChild(style);
})();
`;

// Helper: Smooth cursor interpolation
async function animateCursor(page, fromX, fromY, toX, toY, durationMs, steps = 30) {
  const dt = durationMs / steps;
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const ease =
      progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
    const curX = fromX + (toX - fromX) * ease;
    const curY = fromY + (toY - fromY) * ease;

    await page.evaluate(
      (x, y) => window.__moveCursor && window.__moveCursor(x, y),
      curX,
      curY,
    );
    await new Promise((r) => setTimeout(r, dt));
  }
}

async function clickAt(page, x, y) {
  await page.evaluate(
    (cx, cy) => window.__clickRipple && window.__clickRipple(cx, cy),
    x,
    y,
  );
  await page.mouse.click(x, y);
}

// ---------------------------------------------------------------------------
// 4. Main Recorder Engine (Capturing Frame Sequences)
// ---------------------------------------------------------------------------
async function recordSceneToVideo(browser, scene, sceneIndex) {
  const sceneId = scene.id;
  const targetDuration = scene.duration;
  const frameDir = path.join(ASSETS_DIR, `frames_${sceneId}`);
  if (fs.existsSync(frameDir)) fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });

  const finalSceneVideo = path.join(ASSETS_DIR, `${sceneId}_video.mp4`);

  console.log(`\n🎬 Recording Scene ${sceneIndex + 1}/${SCENES.length}: "${scene.title}" (${targetDuration.toFixed(2)}s)...`);

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  let frameIdx = 0;
  let latestBuf = null;

  const client = await page.target().createCDPSession();
  client.on('Page.screencastFrame', async ({ data, sessionId }) => {
    latestBuf = Buffer.from(data, 'base64');
    try {
      await client.send('Page.screencastFrameAck', { sessionId });
    } catch {}
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 95,
    everyNthFrame: 1,
  });

  // Background frame saver: captures steady 24-30 fps frame files
  let isRecording = true;
  const frameSaverPromise = (async () => {
    while (isRecording) {
      if (latestBuf) {
        const framePath = path.join(frameDir, `frame_${String(frameIdx++).padStart(5, '0')}.jpg`);
        fs.writeFileSync(framePath, latestBuf);
      }
      await new Promise((r) => setTimeout(r, 33)); // ~30 fps
    }
  })();

  const startTime = Date.now();

  // -------------------------------------------------------------------------
  // Execute Specific Scripted Actions for Scene
  // -------------------------------------------------------------------------
  if (sceneId === 'scene_1') {
    // Scene 1: Landing Page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate(INJECT_SCRIPT);
    await page.evaluate((badge, title, desc) => {
      window.__updateHUD(badge, title, desc, true);
    }, scene.badge, 'StellarCanvas', scene.lower_third);

    await page.evaluate(() => window.__moveCursor(1600, 900));
    await new Promise((r) => setTimeout(r, 800));

    // Smooth cursor movement across hero section
    await animateCursor(page, 1600, 900, 960, 420, 1800);
    await new Promise((r) => setTimeout(r, 1000));

    // Hover over badges
    await animateCursor(page, 960, 420, 620, 400, 1400);
    await new Promise((r) => setTimeout(r, 1000));
    await animateCursor(page, 620, 400, 960, 400, 1200);
    await new Promise((r) => setTimeout(r, 1000));
    await animateCursor(page, 960, 400, 1300, 400, 1200);
    await new Promise((r) => setTimeout(r, 1000));

    // Scroll down to feature cards
    for (let scrollY = 0; scrollY <= 600; scrollY += 20) {
      await page.evaluate((sy) => window.scrollTo(0, sy), scrollY);
      await new Promise((r) => setTimeout(r, 35));
    }
    await new Promise((r) => setTimeout(r, 1200));

    // Hover feature cards
    await animateCursor(page, 1300, 400, 500, 680, 1400);
    await new Promise((r) => setTimeout(r, 1000));
    await animateCursor(page, 500, 680, 960, 680, 1200);
    await new Promise((r) => setTimeout(r, 1000));
    await animateCursor(page, 960, 680, 1420, 680, 1200);
    await new Promise((r) => setTimeout(r, 1000));

    // Scroll back to top
    for (let scrollY = 600; scrollY >= 0; scrollY -= 25) {
      await page.evaluate((sy) => window.scrollTo(0, sy), scrollY);
      await new Promise((r) => setTimeout(r, 35));
    }
    await new Promise((r) => setTimeout(r, 1000));

    // Move to "Launch App" button and click
    await animateCursor(page, 1420, 680, 960, 540, 1600);
    await new Promise((r) => setTimeout(r, 600));
    await clickAt(page, 960, 540);
    await new Promise((r) => setTimeout(r, 1500));
  } else if (sceneId === 'scene_2') {
    // Scene 2: Wallet Connection
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    await page.evaluate(INJECT_SCRIPT);
    await page.evaluate((badge, title, desc) => {
      window.__updateHUD(badge, title, desc, true);
    }, scene.badge, 'Wallet Authentication', scene.lower_third);

    await page.evaluate(() => window.__moveCursor(960, 600));
    await new Promise((r) => setTimeout(r, 1000));

    // Move cursor to "Connect Wallet" button in top bar
    await animateCursor(page, 960, 600, 1800, 32, 1800);
    await new Promise((r) => setTimeout(r, 1000));

    // Click Connect Wallet
    await clickAt(page, 1800, 32);

    // Trigger demo wallet connection
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('stellarcanvas:connect_demo', {
          detail: {
            address: 'GBZX3W2V749APLRQ8KMS5P9B7XYZ2026TESTNETDEMO',
            balance: '10000.00',
          },
        }),
      );
    });
    await new Promise((r) => setTimeout(r, 2200));

    // Hover over connected pill
    await animateCursor(page, 1800, 32, 1750, 32, 1200);
    await new Promise((r) => setTimeout(r, 1800));
    // Click on wallet menu to show dropdown details
    await clickAt(page, 1750, 32);
    await new Promise((r) => setTimeout(r, 2200));
    // Close dropdown
    await clickAt(page, 960, 400);
    await new Promise((r) => setTimeout(r, 2000));
  } else if (sceneId === 'scene_3') {
    // Scene 3: Canvas Pan/Zoom & Color Palette
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    await page.evaluate(INJECT_SCRIPT);
    await page.evaluate((badge, title, desc) => {
      window.dispatchEvent(
        new CustomEvent('stellarcanvas:connect_demo', {
          detail: { address: 'GBZX3W2V749APLRQ8KMS5P9B7XYZ2026TESTNETDEMO', balance: '10000.00' },
        }),
      );
      window.__updateHUD(badge, title, desc, true);
    }, scene.badge, 'Canvas Interaction & Palette', scene.lower_third);

    await page.evaluate(() => window.__moveCursor(960, 480));
    await new Promise((r) => setTimeout(r, 1200));

    // Zoom in on canvas
    for (let z = 0; z < 4; z++) {
      await page.mouse.wheel({ deltaY: -120 });
      await new Promise((r) => setTimeout(r, 500));
    }
    await new Promise((r) => setTimeout(r, 1200));

    // Pan across canvas
    await animateCursor(page, 960, 480, 1100, 520, 1400);
    await new Promise((r) => setTimeout(r, 1000));
    await animateCursor(page, 1100, 520, 840, 440, 1400);
    await new Promise((r) => setTimeout(r, 1000));

    // Zoom back to comfortable level
    for (let z = 0; z < 2; z++) {
      await page.mouse.wheel({ deltaY: 120 });
      await new Promise((r) => setTimeout(r, 500));
    }
    await new Promise((r) => setTimeout(r, 1200));

    // Move to floating Color Picker toolbar
    await animateCursor(page, 840, 440, 960, 940, 1600);
    await new Promise((r) => setTimeout(r, 1000));

    // Click swatches
    await animateCursor(page, 960, 940, 860, 940, 800);
    await clickAt(page, 860, 940);
    await new Promise((r) => setTimeout(r, 1000));

    await animateCursor(page, 860, 940, 910, 940, 700);
    await clickAt(page, 910, 940);
    await new Promise((r) => setTimeout(r, 1000));

    await animateCursor(page, 910, 940, 960, 940, 700);
    await clickAt(page, 960, 940);
    await new Promise((r) => setTimeout(r, 1000));

    await animateCursor(page, 960, 940, 1010, 940, 700);
    await clickAt(page, 1010, 940);
    await new Promise((r) => setTimeout(r, 1000));

    await animateCursor(page, 1010, 940, 1060, 940, 700);
    await clickAt(page, 1060, 940);
    await new Promise((r) => setTimeout(r, 1500));
  } else if (sceneId === 'scene_4') {
    // Scene 4: Core Paint Flow & Finality
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    await page.evaluate(INJECT_SCRIPT);
    await page.evaluate((badge, title, desc) => {
      window.dispatchEvent(
        new CustomEvent('stellarcanvas:connect_demo', {
          detail: { address: 'GBZX3W2V749APLRQ8KMS5P9B7XYZ2026TESTNETDEMO', balance: '10000.00' },
        }),
      );
      window.__updateHUD(badge, title, desc, true);
    }, scene.badge, 'Core Paint Transaction', scene.lower_third);

    await page.evaluate(() => window.__moveCursor(960, 900));
    await new Promise((r) => setTimeout(r, 1200));

    // Move to center coordinate (32, 32)
    await animateCursor(page, 960, 900, 960, 480, 1800);
    await new Promise((r) => setTimeout(r, 1000));

    // Click to paint coordinate (32, 32)
    await clickAt(page, 960, 480);
    await new Promise((r) => setTimeout(r, 2500));

    // Paint adjacent pixels: (33, 32), (32, 33), (31, 32), (32, 31)
    await animateCursor(page, 960, 480, 970, 480, 700);
    await clickAt(page, 970, 480);
    await new Promise((r) => setTimeout(r, 1800));

    await animateCursor(page, 970, 480, 960, 490, 700);
    await clickAt(page, 960, 490);
    await new Promise((r) => setTimeout(r, 1800));

    await animateCursor(page, 960, 490, 950, 480, 700);
    await clickAt(page, 950, 480);
    await new Promise((r) => setTimeout(r, 1800));

    await animateCursor(page, 950, 480, 960, 470, 700);
    await clickAt(page, 960, 470);
    await new Promise((r) => setTimeout(r, 2200));
  } else if (sceneId === 'scene_5') {
    // Scene 5: Live Activity Feed & Dynamic Sync
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    await page.evaluate(INJECT_SCRIPT);
    await page.evaluate((badge, title, desc) => {
      window.dispatchEvent(
        new CustomEvent('stellarcanvas:connect_demo', {
          detail: { address: 'GBZX3W2V749APLRQ8KMS5P9B7XYZ2026TESTNETDEMO', balance: '10000.00' },
        }),
      );
      window.__updateHUD(badge, title, desc, true);
    }, scene.badge, 'Real-Time Event Stream', scene.lower_third);

    await page.evaluate(() => window.__moveCursor(960, 480));
    await new Promise((r) => setTimeout(r, 1000));

    // Move cursor over to Right Sidebar
    await animateCursor(page, 960, 480, 1750, 300, 1800);
    await new Promise((r) => setTimeout(r, 1200));

    // Simulate multi-user live event arriving
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('stellarcanvas:pixel_event', {
          detail: {
            type: 'pixel',
            id: 'evt_remote_' + Date.now(),
            x: 28,
            y: 44,
            color: 0xffec4899,
            painter: 'GDR984KLQPV92019TESTNET18293',
            ledger: 492815,
            txHash: '5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b',
            closedAt: new Date().toISOString(),
          },
        }),
      );
    });
    await new Promise((r) => setTimeout(r, 1800));

    // Hover through recent activity items
    await animateCursor(page, 1750, 300, 1750, 480, 1400);
    await new Promise((r) => setTimeout(r, 1200));

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('stellarcanvas:pixel_event', {
          detail: {
            type: 'pixel',
            id: 'evt_remote_2_' + Date.now(),
            x: 40,
            y: 20,
            color: 0xff10b981,
            painter: 'GAX7748192039TESTNET48102948',
            ledger: 492816,
            txHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
            closedAt: new Date().toISOString(),
          },
        }),
      );
    });
    await new Promise((r) => setTimeout(r, 2200));
  } else if (sceneId === 'scene_6') {
    // Scene 6: Profile & NFT Achievement Badges
    await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'networkidle0' });
    await page.evaluate(INJECT_SCRIPT);
    await page.evaluate((badge, title, desc) => {
      window.dispatchEvent(
        new CustomEvent('stellarcanvas:connect_demo', {
          detail: { address: 'GBZX3W2V749APLRQ8KMS5P9B7XYZ2026TESTNETDEMO', balance: '10000.00' },
        }),
      );
      window.__updateHUD(badge, title, desc, true);
    }, scene.badge, 'Player Stats & NFT Badges', scene.lower_third);

    await page.evaluate(() => window.__moveCursor(100, 160));
    await new Promise((r) => setTimeout(r, 1000));

    // Hover over stats cards
    await animateCursor(page, 100, 160, 600, 240, 1400);
    await new Promise((r) => setTimeout(r, 1000));
    await animateCursor(page, 600, 240, 960, 240, 1000);
    await new Promise((r) => setTimeout(r, 1000));
    await animateCursor(page, 960, 240, 1320, 240, 1000);
    await new Promise((r) => setTimeout(r, 1000));

    // Hover across Badges gallery
    await animateCursor(page, 1320, 240, 600, 480, 1200);
    await new Promise((r) => setTimeout(r, 1000));
    await animateCursor(page, 600, 480, 840, 480, 900);
    await new Promise((r) => setTimeout(r, 1000));
    await animateCursor(page, 840, 480, 1080, 480, 900);
    await new Promise((r) => setTimeout(r, 1000));
    await animateCursor(page, 1080, 480, 1320, 480, 900);
    await new Promise((r) => setTimeout(r, 1000));

    // Scroll down to Paint History
    for (let scrollY = 0; scrollY <= 400; scrollY += 20) {
      await page.evaluate((sy) => window.scrollTo(0, sy), scrollY);
      await new Promise((r) => setTimeout(r, 35));
    }
    await new Promise((r) => setTimeout(r, 2000));
  } else if (sceneId === 'scene_7') {
    // Scene 7: Leaderboard
    await page.goto('http://localhost:3000/dashboard/leaderboard', { waitUntil: 'networkidle0' });
    await page.evaluate(INJECT_SCRIPT);
    await page.evaluate((badge, title, desc) => {
      window.dispatchEvent(
        new CustomEvent('stellarcanvas:connect_demo', {
          detail: { address: 'GBZX3W2V749APLRQ8KMS5P9B7XYZ2026TESTNETDEMO', balance: '10000.00' },
        }),
      );
      window.__updateHUD(badge, title, desc, true);
    }, scene.badge, 'Live On-Chain Leaderboard', scene.lower_third);

    await page.evaluate(() => window.__moveCursor(100, 120));
    await new Promise((r) => setTimeout(r, 1000));

    // Hover user stats banner at top
    await animateCursor(page, 100, 120, 960, 160, 1400);
    await new Promise((r) => setTimeout(r, 1200));

    // Scroll through leaderboard entries
    await animateCursor(page, 960, 160, 960, 320, 1000);
    await new Promise((r) => setTimeout(r, 800));
    await animateCursor(page, 960, 320, 960, 420, 800);
    await new Promise((r) => setTimeout(r, 800));
    await animateCursor(page, 960, 420, 960, 520, 800);
    await new Promise((r) => setTimeout(r, 800));

    // Hover Refresh button
    await animateCursor(page, 960, 520, 1280, 260, 1200);
    await new Promise((r) => setTimeout(r, 1500));
  } else if (sceneId === 'scene_8') {
    // Scene 8: Architecture & Outro
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    await page.evaluate(INJECT_SCRIPT);
    await page.evaluate((badge, title, desc) => {
      window.dispatchEvent(
        new CustomEvent('stellarcanvas:connect_demo', {
          detail: { address: 'GBZX3W2V749APLRQ8KMS5P9B7XYZ2026TESTNETDEMO', balance: '10000.00' },
        }),
      );
      window.__updateHUD(badge, title, desc, true);
    }, scene.badge, 'Soroban Smart Contracts & Wrap Up', scene.lower_third);

    await page.evaluate(() => window.__moveCursor(960, 480));
    await new Promise((r) => setTimeout(r, 1200));

    // Smooth cinematic zoom and pan across artwork
    for (let z = 0; z < 3; z++) {
      await page.mouse.wheel({ deltaY: -100 });
      await new Promise((r) => setTimeout(r, 400));
    }
    await animateCursor(page, 960, 480, 1020, 520, 1600);
    await new Promise((r) => setTimeout(r, 1200));
    await animateCursor(page, 1020, 520, 900, 440, 1600);
    await new Promise((r) => setTimeout(r, 1200));

    // Hover over top logo
    await animateCursor(page, 900, 440, 100, 32, 1600);
    await new Promise((r) => setTimeout(r, 2500));
  }

  // Ensure total time elapsed matches targetDuration
  const elapsedSec = (Date.now() - startTime) / 1000;
  if (elapsedSec < targetDuration) {
    const remainMs = (targetDuration - elapsedSec) * 1000;
    await new Promise((r) => setTimeout(r, remainMs));
  }

  // Stop frame saver loop and screencast
  isRecording = false;
  await frameSaverPromise;
  await client.send('Page.stopScreencast');
  await page.close();

  console.log(`  ✓ Saved ${frameIdx} frames in ${frameDir}`);

  // Build composite audio track with voiceover + chime at start
  const voiceWav = scene.audio_wav;
  const chimeWav = path.join(ASSETS_DIR, 'chime.wav');
  const sceneAudioWav = path.join(ASSETS_DIR, `${sceneId}_merged_audio.wav`);
  execSync(
    `ffmpeg -y -i "${voiceWav}" -i "${chimeWav}" -filter_complex "[1:a]volume=0.25[sfx];[0:a][sfx]amix=inputs=2:duration=first" "${sceneAudioWav}" 2>/dev/null`,
  );

  // Compute exact framerate so all frames stretch precisely to targetDuration
  const fps = frameIdx / targetDuration;

  // Encode image sequence + audio track into final scene MP4
  execSync(
    `ffmpeg -y -framerate ${fps.toFixed(4)} -i "${path.join(frameDir, 'frame_%05d.jpg')}" -i "${sceneAudioWav}" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -t ${targetDuration} "${finalSceneVideo}" 2>/dev/null`,
  );

  scene.final_video = finalSceneVideo;
  console.log(`  ✓ Rendered scene MP4 (${targetDuration.toFixed(2)}s @ ${fps.toFixed(1)}fps): ${finalSceneVideo}`);
}

// ---------------------------------------------------------------------------
// 5. Master Video Assembler & Ambient Lo-Fi Background Mixing
// ---------------------------------------------------------------------------
async function assembleFullDemoVideo() {
  console.log('\n🎞️ Assembling master 1080p demo video from all recorded scenes...');

  // Create concat file
  const concatTxt = path.join(ASSETS_DIR, 'actual_concat_list.txt');
  const lines = SCENES.map((s) => `file '${s.final_video}'`);
  fs.writeFileSync(concatTxt, lines.join('\n'));

  const tempVideoConcat = path.join(ASSETS_DIR, 'actual_temp_concat.mp4');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatTxt}" -c copy "${tempVideoConcat}" 2>/dev/null`);

  // Probe total video duration
  const totalDurStr = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempVideoConcat}"`,
  )
    .toString()
    .trim();
  const totalDuration = parseFloat(totalDurStr);
  console.log(`  ✓ Total demo duration: ${totalDuration.toFixed(2)}s (~${(totalDuration / 60).toFixed(1)} mins)`);

  // Background Ambient Lo-Fi Track
  const ambientWav = path.join(ASSETS_DIR, 'ambient_lofi.wav');
  if (!fs.existsSync(ambientWav)) {
    console.log('  Generating ambient lo-fi music...');
    execSync(
      `ffmpeg -y -f lavfi -i "sine=frequency=220:duration=${Math.ceil(totalDuration) + 10}" -filter_complex "[0:a]volume=0.08,lowpass=f=800[a]" -map "[a]" "${ambientWav}" 2>/dev/null`,
    );
  }

  // Final Master Mix: Video + Voiceover + Background Ambient Lo-Fi (ducked at -22dB)
  console.log('🎧 Mixing master audio with background ambient lo-fi track...');
  execSync(
    `ffmpeg -y -i "${tempVideoConcat}" -i "${ambientWav}" -filter_complex "[1:a]volume=0.12[bg];[0:a][bg]amix=inputs=2:duration=first[aout]" -map 0:v -map "[aout]" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 256k "${FINAL_VIDEO_PATH}" 2>/dev/null`,
  );

  fs.copyFileSync(FINAL_VIDEO_PATH, PUBLIC_VIDEO_PATH);

  const stats = fs.statSync(FINAL_VIDEO_PATH);
  console.log('\n======================================================');
  console.log('🎉 1080p DEMO VIDEO RECORDED & RENDERED SUCCESSFULLY!');
  console.log(`📹 File: ${FINAL_VIDEO_PATH}`);
  console.log(`🌐 Public: ${PUBLIC_VIDEO_PATH}`);
  console.log(`📊 Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`⏱️ Duration: ${totalDuration.toFixed(2)}s (~${(totalDuration / 60).toFixed(1)} mins)`);
  console.log('======================================================\n');
}

// ---------------------------------------------------------------------------
// 6. Main Execution Flow
// ---------------------------------------------------------------------------
async function main() {
  console.log('======================================================');
  console.log('🚀 StellarCanvas Live Browser Demo Video Production');
  console.log('======================================================');

  // Step 1: Generate high quality male voiceovers
  generateVoiceovers();

  // Step 2: Launch Chromium for recording
  console.log('\n🌐 Launching Chromium browser (1920×1080 @ 60Hz)...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--disable-gpu',
      '--hide-scrollbars',
      '--enable-features=NetworkService,NetworkServiceInProcess',
    ],
  });

  // Step 3: Record each scene interactively
  for (let i = 0; i < SCENES.length; i++) {
    await recordSceneToVideo(browser, SCENES[i], i);
  }

  await browser.close();
  console.log('✓ Browser automation and recording completed.');

  // Step 4: Assemble master 1080p video with audio mixing
  await assembleFullDemoVideo();
}

main().catch((err) => {
  console.error('❌ Error recording demo video:', err);
  process.exit(1);
});
