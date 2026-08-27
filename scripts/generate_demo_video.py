#!/usr/bin/env python3
"""
StellarCanvas Demo Video Generator (Full 1080p @ 30fps)
Generates a complete product demo video with professional male neural voiceover,
authentic glassmorphism UI visuals, sound effects, motion graphics, and subtitles.
"""

import os
import sys
import json
import time
import math
import wave
import struct
import base64
import asyncio
import subprocess
import urllib.request
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WORK_DIR = "/home/om/Documents/Stellar/StellarCanvas"
ASSETS_DIR = os.path.join(WORK_DIR, "scripts/video_assets")
OUTPUT_DIR = os.path.join(WORK_DIR, "public")
FINAL_VIDEO_PATH = os.path.join(OUTPUT_DIR, "stellar_canvas_demo_1080p.mp4")
ROOT_VIDEO_PATH = os.path.join(WORK_DIR, "stellar_canvas_demo_1080p.mp4")

os.makedirs(ASSETS_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ----------------------------------------------------------------------
# 1. Voiceover Scripts for Each Scene
# ----------------------------------------------------------------------
SCENES = [
    {
        "id": "scene_1",
        "title": "Hook & The Vision",
        "subtitle_text": "StellarCanvas: A decentralized, 64x64 collaborative pixel canvas on Stellar Soroban.",
        "narration": "What happens when you bring collaborative digital art directly onto the blockchain? Welcome to StellarCanvas — a decentralized, 64-by-64 collaborative pixel canvas built natively on Stellar Soroban.",
        "badge": "100% ON-CHAIN • SOROBAN TESTNET",
        "lower_third": "StellarCanvas | Decentralized Collaborative Art"
    },
    {
        "id": "scene_2",
        "title": "Architecture & Soroban Contracts",
        "subtitle_text": "Three modular Rust smart contracts with direct Soroban RPC event polling.",
        "narration": "Every single pixel placed isn't just stored in a web database — it's an immutable smart contract invocation. Powered by three modular Rust contracts: Pixel, Leaderboard, and Achievement, communicating directly with Soroban RPC nodes.",
        "badge": "ARCHITECTURE • 3 MODULAR SMART CONTRACTS",
        "lower_third": "Rust Smart Contracts & Zero Backend Architecture"
    },
    {
        "id": "scene_3",
        "title": "Seamless Wallet Connection",
        "subtitle_text": "Instant Web3 authentication via StellarWalletsKit supporting Freighter, Albedo & Lobstr.",
        "narration": "Connecting to Web3 on Stellar is instantaneous. With integrated StellarWalletsKit support, users can choose Freighter, Albedo, xBull, or Lobstr. Once connected, your wallet balance and public key are verified directly on the Stellar testnet.",
        "badge": "STELLARWALLETSKIT • INSTANT AUTH",
        "lower_third": "Self-Custodial Wallet Integration"
    },
    {
        "id": "scene_4",
        "title": "Interactive 64x64 Canvas",
        "subtitle_text": "Hardware-accelerated grid with 0.5x to 20x smooth zoom and 24 curated color presets.",
        "narration": "Here is the battlefield: a 4,096-pixel grid rendered on a high-performance HTML5 Canvas element. With full hardware acceleration, you get fluid multi-touch zoom up to 20x, smooth click-and-drag panning, and 24 curated preset hex palettes.",
        "badge": "64x64 GRID • 4,096 ON-CHAIN PIXELS",
        "lower_third": "Smooth Pan/Zoom & Color Palette System"
    },
    {
        "id": "scene_5",
        "title": "Paint Flow & Sub-2s Finality",
        "subtitle_text": "Single-click contract invocation with deterministic testnet finality in under 2 seconds.",
        "narration": "Now, let's claim a pixel at coordinate 32, 32. Clicking the grid immediately initiates an on-chain paint_pixel invocation. Freighter prompts us to sign... and in less than two seconds, Stellar achieves deterministic finality!",
        "badge": "CONTRACT INVOCATION • paint_pixel(32, 32)",
        "lower_third": "Instant On-Chain Settlement & Explorer Link"
    },
    {
        "id": "scene_6",
        "title": "Real-Time Event Streaming",
        "subtitle_text": "Live event streaming via Soroban getEvents() with automatic multi-user canvas sync.",
        "narration": "Notice how the rest of the application reacted. StellarCanvas features a decentralized Event Provider that continuously streams PixelPainted events directly from Soroban RPC endpoints. When other artists paint, your screen updates in real time.",
        "badge": "SOROBAN RPC • getEvents() STREAMING",
        "lower_third": "Live Event Stream & Automatic State Sync"
    },
    {
        "id": "scene_7",
        "title": "NFT Achievement Badges & Profile",
        "subtitle_text": "Gamified milestone badges (First Pixel, Pixel Artist, Top 10) tracked on-chain.",
        "narration": "Painting pixels isn't just about art — it's a competitive game. Hitting key milestones unlocks on-chain NFT-style achievement badges like First Pixel and Pixel Artist, which you can track alongside your full paint history in your Profile.",
        "badge": "GAMIFICATION • NFT ACHIEVEMENT BADGES",
        "lower_third": "Player Stats, Badges & Historical Logs"
    },
    {
        "id": "scene_8",
        "title": "Live On-Chain Leaderboard",
        "subtitle_text": "Top 10 hall of fame dynamically re-ranked on every paint transaction.",
        "narration": "For competitive painters, the Leaderboard provides a real-time hall of fame. Ranks 1 through 10 are queried directly from the Leaderboard smart contract, tracking the most prolific painters across the network with live dynamic re-ranking.",
        "badge": "LIVE LEADERBOARD • TOP 10 RANKINGS",
        "lower_third": "On-Chain Sorted PlayerList & Stats"
    },
    {
        "id": "scene_9",
        "title": "Smart Contract Testing & Optimization",
        "subtitle_text": "Row-sliced reads for Soroban storage budget limits and 100% test coverage (18/18).",
        "narration": "To respect Soroban's 100-entry persistent storage read budget, StellarCanvas implements row-sliced reads to seamlessly assemble the full canvas. With 100% test coverage across all 18 contract tests, it's completely production-ready.",
        "badge": "RUST SOROBAN SDK • 18/18 TESTS PASSING",
        "lower_third": "Optimized Storage Slicing & Test Suite"
    },
    {
        "id": "scene_10",
        "title": "Conclusion & Call to Action",
        "subtitle_text": "Try the live demo on Stellar Testnet and explore the open-source GitHub repository.",
        "narration": "StellarCanvas showcases the true potential of Stellar Soroban: high-throughput, low-cost, real-time decentralized applications. Connect your wallet, claim your coordinate, and make your mark on history!",
        "badge": "OPEN SOURCE • STELLAR SOROBAN",
        "lower_third": "Live Demo: stellar-canvas.vercel.app"
    }
]

# ----------------------------------------------------------------------
# 2. Audio Synthesis Helpers (SFX & Ambient Track)
# ----------------------------------------------------------------------
def generate_sfx(filename, sfx_type="chime"):
    sample_rate = 44100
    filepath = os.path.join(ASSETS_DIR, filename)
    
    if sfx_type == "chime":
        # Multi-harmonic chime (D major: D5, A5, D6, F#6)
        duration = 1.2
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        freqs = [587.33, 880.0, 1174.66, 1479.98, 1760.0]
        sig = np.zeros_like(t)
        for i, f in enumerate(freqs):
            decay = np.exp(-t * (4.0 + i * 1.5))
            sig += (0.25 / (i + 1)**0.5) * np.sin(2 * np.pi * f * t) * decay
    elif sfx_type == "click":
        duration = 0.08
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        sig = np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 80)
    elif sfx_type == "whoosh":
        duration = 0.4
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        noise = np.random.uniform(-1, 1, len(t))
        envelope = np.sin(np.pi * t / duration) ** 2
        sig = noise * envelope * 0.3
    elif sfx_type == "fanfare":
        duration = 1.8
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        # Victory chord arpeggio
        sig = np.zeros_like(t)
        notes = [(0.0, 523.25), (0.15, 659.25), (0.3, 783.99), (0.45, 1046.50)]
        for start_t, freq in notes:
            mask = t >= start_t
            t_sub = t[mask] - start_t
            decay = np.exp(-t_sub * 2.5)
            sig[mask] += 0.25 * np.sin(2 * np.pi * freq * t_sub) * decay
    else:
        duration = 0.5
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        sig = np.sin(2 * np.pi * 440 * t) * np.exp(-t * 4)

    sig = sig / (np.max(np.abs(sig)) + 1e-6)
    sig = (sig * 32767 * 0.85).astype(np.int16)

    with wave.open(filepath, 'w') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(sig.tobytes())
    return filepath

def generate_ambient_music(total_duration, output_wav):
    """Generates a pleasant, atmospheric lo-fi cyberpunk ambient chord progression."""
    sample_rate = 44100
    t = np.linspace(0, total_duration, int(sample_rate * total_duration), False)
    music = np.zeros_like(t)
    
    # Chord progression: Dm9 -> Bbmaj7 -> Fmaj7 -> C9 (8 seconds per chord)
    chord_len = 8.0
    chords = [
        [146.83, 220.00, 261.63, 329.63, 440.00],  # Dm9
        [116.54, 174.61, 233.08, 293.66, 349.23],  # Bbmaj7
        [174.61, 220.00, 261.63, 349.23, 440.00],  # Fmaj7
        [130.81, 196.00, 246.94, 293.66, 392.00]   # G/C
    ]
    
    num_repeats = int(math.ceil(total_duration / (len(chords) * chord_len)))
    for rep in range(num_repeats):
        for c_idx, freqs in enumerate(chords):
            start_t = (rep * len(chords) + c_idx) * chord_len
            if start_t >= total_duration:
                break
            end_t = min(start_t + chord_len, total_duration)
            idx_start = int(start_t * sample_rate)
            idx_end = int(end_t * sample_rate)
            t_chunk = t[idx_start:idx_end] - start_t
            
            # Smooth pad envelope (fade in 1.5s, sustain, fade out 1.5s)
            dur_chunk = end_t - start_t
            env = np.ones_like(t_chunk)
            fade_in = int(1.5 * sample_rate)
            fade_out = int(1.5 * sample_rate)
            if len(env) > fade_in:
                env[:fade_in] = np.linspace(0, 1, fade_in)
            if len(env) > fade_out:
                env[-fade_out:] = np.linspace(1, 0, fade_out)
                
            chunk_sig = np.zeros_like(t_chunk)
            for f in freqs:
                # Add fundamental + warm second harmonic
                chunk_sig += 0.15 * np.sin(2 * np.pi * f * t_chunk)
                chunk_sig += 0.05 * np.sin(2 * np.pi * (f * 2) * t_chunk)
                # Subtle chorus / detune
                chunk_sig += 0.08 * np.sin(2 * np.pi * (f * 1.002) * t_chunk)
                
            music[idx_start:idx_end] += chunk_sig * env

    # Gentle master fade-in and fade-out
    master_fade = int(2.5 * sample_rate)
    if len(music) > master_fade:
        music[:master_fade] *= np.linspace(0, 1, master_fade)
        music[-master_fade:] *= np.linspace(1, 0, master_fade)

    music = music / (np.max(np.abs(music)) + 1e-6)
    music = (music * 32767 * 0.22).astype(np.int16) # soft background level

    with wave.open(output_wav, 'w') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(music.tobytes())

# ----------------------------------------------------------------------
# 3. Text-to-Speech Generation using Edge-TTS
# ----------------------------------------------------------------------
def generate_voiceovers():
    print("🎙️ Generating professional male voiceovers via Edge-TTS (en-US-AndrewMultilingualNeural)...")
    for scene in SCENES:
        sid = scene["id"]
        text = scene["narration"]
        mp3_path = os.path.join(ASSETS_DIR, f"{sid}_voice.mp3")
        wav_path = os.path.join(ASSETS_DIR, f"{sid}_voice.wav")
        
        cmd = [
            "/home/om/.local/bin/edge-tts",
            "--voice", "en-US-AndrewMultilingualNeural",
            "--rate", "+0%",
            "--text", text,
            "--write-media", mp3_path
        ]
        subprocess.run(cmd, check=True)
        
        # Convert to WAV and get exact duration
        cmd_conv = ["ffmpeg", "-y", "-i", mp3_path, "-ar", "44100", "-ac", "1", wav_path]
        subprocess.run(cmd_conv, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        
        # Probe duration
        probe = subprocess.check_output([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", wav_path
        ]).decode().strip()
        dur = float(probe)
        scene["audio_wav"] = wav_path
        # Add 1.2s padding for smooth pacing
        scene["duration"] = max(dur + 1.2, 5.0)
        print(f"  ✓ {sid}: {scene['duration']:.2f}s (voice: {dur:.2f}s) -> '{scene['title']}'")

# ----------------------------------------------------------------------
# 4. High-Fidelity 1080p Visual Frame Compositor
# ----------------------------------------------------------------------
def create_gradient_canvas(w=1920, h=1080):
    """Creates a sleek, dark futuristic background canvas with purple/cyan ambient glow."""
    img = Image.new("RGBA", (w, h), (10, 11, 20, 255))
    draw = ImageDraw.Draw(img)
    
    # Subtle background radial glows
    # Top-center purple glow
    glow1 = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw1 = ImageDraw.Draw(glow1)
    gdraw1.ellipse([w//2 - 500, -250, w//2 + 500, 450], fill=(140, 82, 255, 35))
    glow1 = glow1.filter(ImageFilter.GaussianBlur(120))
    img = Image.alpha_composite(img, glow1)
    
    # Bottom-right cyan glow
    glow2 = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw2 = ImageDraw.Draw(glow2)
    gdraw2.ellipse([w - 400, h - 350, w + 300, h + 300], fill=(0, 245, 255, 25))
    glow2 = glow2.filter(ImageFilter.GaussianBlur(100))
    img = Image.alpha_composite(img, glow2)
    
    return img

def get_fonts():
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/TTF/FiraSans-Bold.ttf", 42)
        font_sub = ImageFont.truetype("/usr/share/fonts/TTF/FiraSans-Regular.ttf", 26)
        font_badge = ImageFont.truetype("/usr/share/fonts/TTF/FiraSans-SemiBold.ttf", 18)
        font_code = ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSansMono.ttf", 20)
        font_sm = ImageFont.truetype("/usr/share/fonts/TTF/FiraSans-Medium.ttf", 20)
    except Exception:
        # Fallback to default
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_badge = font_title
        font_code = font_title
        font_sm = font_title
    return font_title, font_sub, font_badge, font_code, font_sm

def draw_top_nav(img, connected=True, xlm_balance="10,000 XLM", address="GABC...XYZ1"):
    """Draws the top navigation bar."""
    draw = ImageDraw.Draw(img)
    w, h = 1920, 1080
    font_title, font_sub, font_badge, font_code, font_sm = get_fonts()
    
    # Top bar background
    bar_rect = [60, 30, w - 60, 90]
    draw.rounded_rectangle(bar_rect, radius=16, fill=(20, 22, 38, 220), outline=(255, 255, 255, 30), width=1)
    
    # Logo
    draw.ellipse([85, 45, 115, 75], fill=(140, 82, 255, 255))
    draw.text((130, 48), "StellarCanvas", fill=(255, 255, 255, 255), font=font_sm)
    
    # Nav Links
    navs = ["Canvas", "Leaderboard", "Profile", "Docs"]
    nx = 380
    for nav in navs:
        draw.text((nx, 50), nav, fill=(200, 205, 225, 230), font=font_sm)
        nx += 160
        
    # Wallet Button
    if connected:
        btn_rect = [w - 420, 42, w - 85, 78]
        draw.rounded_rectangle(btn_rect, radius=12, fill=(140, 82, 255, 40), outline=(140, 82, 255, 180), width=1)
        # Green pulsing dot
        draw.ellipse([w - 400, 56, w - 390, 66], fill=(52, 211, 153, 255))
        draw.text((w - 375, 49), f"{address}  |  {xlm_balance}", fill=(240, 240, 255, 255), font=font_sm)
    else:
        btn_rect = [w - 260, 42, w - 85, 78]
        draw.rounded_rectangle(btn_rect, radius=12, fill=(140, 82, 255, 220), outline=(200, 160, 255, 255), width=1)
        draw.text((w - 235, 49), "Connect Wallet", fill=(255, 255, 255, 255), font=font_sm)

def draw_hud_overlays(img, scene, progress_ratio=0.5):
    """Draws professional lower-third, top badge, progress bar, and subtitle."""
    draw = ImageDraw.Draw(img)
    w, h = 1920, 1080
    font_title, font_sub, font_badge, font_code, font_sm = get_fonts()
    
    # Top-left scene badge
    badge_text = scene.get("badge", "STELLAR SOROBAN")
    bw = len(badge_text) * 11 + 32
    draw.rounded_rectangle([70, 115, 70 + bw, 150], radius=8, fill=(140, 82, 255, 200), outline=(255, 255, 255, 50))
    draw.text((86, 122), badge_text, fill=(255, 255, 255, 255), font=font_badge)
    
    # Lower-third box (Left)
    lt_text = scene.get("lower_third", "")
    if lt_text:
        lt_w = len(lt_text) * 14 + 40
        draw.rounded_rectangle([70, h - 190, 70 + lt_w, h - 135], radius=12, fill=(15, 17, 30, 225), outline=(140, 82, 255, 120), width=1)
        draw.text((90, h - 175), lt_text, fill=(255, 255, 255, 255), font=font_sm)
    
    # Subtitle bar (Center-bottom)
    sub_text = scene.get("subtitle_text", "")
    if sub_text:
        sub_w = len(sub_text) * 13 + 60
        sub_rect = [w//2 - sub_w//2, h - 110, w//2 + sub_w//2, h - 55]
        draw.rounded_rectangle(sub_rect, radius=12, fill=(10, 12, 24, 235), outline=(255, 255, 255, 40), width=1)
        draw.text((w//2 - sub_w//2 + 30, h - 96), sub_text, fill=(240, 245, 255, 255), font=font_sub)
        
    # Top progress bar
    draw.rectangle([0, 0, w, 4], fill=(30, 32, 50, 255))
    draw.rectangle([0, 0, int(w * progress_ratio), 4], fill=(140, 82, 255, 255))

# ----------------------------------------------------------------------
# 5. Scene Renderers (Generating 1080p Frames)
# ----------------------------------------------------------------------
def render_scene_1(t, dur):
    """Scene 1: Landing Page Hero & Features Grid."""
    img = create_gradient_canvas()
    draw = ImageDraw.Draw(img)
    font_title, font_sub, font_badge, font_code, font_sm = get_fonts()
    w, h = 1920, 1080
    draw_top_nav(img, connected=False)
    
    # Hero Title with animated letters effect
    title_text = "Claim Your Pixel."
    draw.text((w//2 - 270, 220), title_text, fill=(255, 255, 255, 255), font=font_title)
    
    tagline = "Collaborative on-chain pixel art built natively on Stellar Soroban."
    draw.text((w//2 - 380, 290), tagline, fill=(180, 185, 210, 255), font=font_sub)
    
    # Floating 3D Badges
    b_y1 = 370 + int(8 * math.sin(t * 2.5))
    b_y2 = 370 + int(8 * math.cos(t * 2.2))
    b_y3 = 370 + int(8 * math.sin(t * 2.8 + 1))
    
    badges = [
        ("⚡ Soroban Powered", 500, b_y1, (140, 82, 255, 60), (140, 82, 255, 200)),
        ("🎨 4,096 Pixels", 840, b_y2, (0, 245, 255, 50), (0, 245, 255, 180)),
        ("⚔️ Real-Time War", 1180, b_y3, (245, 158, 11, 50), (245, 158, 11, 180)),
    ]
    for text, bx, by, bg_col, border_col in badges:
        draw.rounded_rectangle([bx, by, bx + 240, by + 50], radius=12, fill=bg_col, outline=border_col, width=1)
        draw.text((bx + 25, by + 12), text, fill=(255, 255, 255, 255), font=font_sm)
        
    # Feature Cards Preview (Bottom)
    features = [
        ("On-Chain Canvas", "Verifiable & immutable grid on Soroban.", 320),
        ("Live Leaderboard", "Instant score updates on every paint.", 720),
        ("NFT Badges", "Milestone rewards for active creators.", 1120),
    ]
    for title, desc, cx in features:
        draw.rounded_rectangle([cx, 470, cx + 360, 610], radius=16, fill=(20, 24, 45, 180), outline=(255, 255, 255, 30), width=1)
        draw.text((cx + 25, 495), title, fill=(255, 255, 255, 255), font=font_sm)
        draw.text((cx + 25, 540), desc, fill=(160, 165, 190, 240), font=font_badge)
        
    # CTA Button
    btn_x, btn_y = w//2 - 130, 660
    draw.rounded_rectangle([btn_x, btn_y, btn_x + 260, btn_y + 60], radius=16, fill=(140, 82, 255, 240), outline=(200, 160, 255, 255), width=1)
    draw.text((btn_x + 50, btn_y + 16), "Launch App ➔", fill=(255, 255, 255, 255), font=font_sm)
    
    return img

def render_scene_2(t, dur):
    """Scene 2: Architecture & Smart Contracts Diagram."""
    img = create_gradient_canvas()
    draw = ImageDraw.Draw(img)
    font_title, font_sub, font_badge, font_code, font_sm = get_fonts()
    w, h = 1920, 1080
    draw_top_nav(img, connected=False)
    
    # Diagram Title
    draw.text((w//2 - 250, 160), "Modular Architecture", fill=(255, 255, 255, 255), font=font_title)
    
    # Frontend Card
    fe_rect = [160, 270, 620, 680]
    draw.rounded_rectangle(fe_rect, radius=18, fill=(22, 25, 48, 220), outline=(140, 82, 255, 150), width=2)
    draw.text((195, 300), "Browser Frontend (Next.js 15)", fill=(255, 255, 255, 255), font=font_sm)
    
    components = [
        ("• 64×64 Pixel Canvas Component", 360),
        ("• EventProvider (RPC getEvents 3s)", 420),
        ("• StellarWalletsKit Provider", 480),
        ("• Live Leaderboard & Profile Views", 540),
        ("• Client.fromWasm() Contract SDK", 600),
    ]
    for c_text, cy in components:
        draw.text((200, cy), c_text, fill=(190, 195, 225, 240), font=font_sm)
        
    # Animated Data Packets (Arrow Flow)
    pulse = (t * 3) % 1.0
    packet_x = int(630 + pulse * 280)
    draw.line([630, 475, 910, 475], fill=(0, 245, 255, 150), width=3)
    draw.ellipse([packet_x - 6, 475 - 6, packet_x + 6, 475 + 6], fill=(0, 245, 255, 255))
    draw.text((680, 440), "getEvents() / Tx", fill=(0, 245, 255, 255), font=font_badge)
    
    # Smart Contracts Card (Right)
    sc_rect = [920, 270, 1760, 680]
    draw.rounded_rectangle(sc_rect, radius=18, fill=(22, 25, 48, 220), outline=(0, 245, 255, 150), width=2)
    draw.text((955, 300), "Stellar Soroban Smart Contracts (Rust)", fill=(255, 255, 255, 255), font=font_sm)
    
    contracts = [
        ("Pixel Contract", "paint_pixel(x, y, color) • 64-Row Storage Slicing • PixelPainted Event", 955, 360),
        ("Leaderboard Contract", "add_score(player) • PlayerList Instance Storage • get_top_players()", 955, 460),
        ("Achievement Contract", "award_badge(player, badge_id) • 4 On-Chain NFT Badges • BadgeAwarded", 955, 560),
    ]
    for c_title, c_desc, cx, cy in contracts:
        draw.rounded_rectangle([cx, cy, cx + 760, cy + 80], radius=12, fill=(15, 18, 35, 200), outline=(255, 255, 255, 30), width=1)
        draw.text((cx + 20, cy + 14), c_title, fill=(140, 82, 255, 255), font=font_sm)
        draw.text((cx + 20, cy + 46), c_desc, fill=(170, 175, 205, 230), font=font_badge)
        
    return img

def render_scene_3(t, dur):
    """Scene 3: Wallet Connection & StellarWalletsKit Modal."""
    img = create_gradient_canvas()
    draw = ImageDraw.Draw(img)
    font_title, font_sub, font_badge, font_code, font_sm = get_fonts()
    w, h = 1920, 1080
    
    # Phase: 0-2s = Opening Modal, 2-4s = Selecting Freighter, 4s+ = Connected
    is_connected = t > 3.2
    draw_top_nav(img, connected=is_connected, xlm_balance="10,000 XLM", address="GABC...XYZ1")
    
    # Background Canvas outline
    draw.rounded_rectangle([380, 170, 1200, 720], radius=16, fill=(16, 18, 32, 200), outline=(255, 255, 255, 25), width=1)
    draw.text((680, 420), "64×64 Pixel Canvas Preview", fill=(100, 105, 130, 200), font=font_title)
    
    # StellarWalletsKit Modal (Centered)
    if t < 3.2:
        m_w, m_h = 520, 480
        mx, my = w//2 - m_w//2, h//2 - m_h//2 + 30
        draw.rounded_rectangle([mx, my, mx + m_w, my + m_h], radius=20, fill=(20, 22, 42, 250), outline=(140, 82, 255, 200), width=2)
        draw.text((mx + 35, my + 30), "Connect Wallet", fill=(255, 255, 255, 255), font=font_title)
        draw.text((mx + 35, my + 85), "Select your preferred Stellar wallet provider:", fill=(170, 175, 200, 230), font=font_badge)
        
        wallets = [
            ("Freighter Wallet", "Browser Extension (Recommended)", my + 130, True),
            ("Albedo", "Web & Mobile Key Manager", my + 210, False),
            ("xBull Wallet", "Multiplatform Stellar Wallet", my + 290, False),
            ("Lobstr", "Stellar Mobile Wallet", my + 370, False),
        ]
        for wname, wdesc, wy, highlighted in wallets:
            bg = (140, 82, 255, 50) if highlighted else (15, 17, 30, 180)
            bord = (140, 82, 255, 200) if highlighted else (255, 255, 255, 30)
            draw.rounded_rectangle([mx + 35, wy, mx + m_w - 35, wy + 65], radius=12, fill=bg, outline=bord, width=1)
            draw.text((mx + 60, wy + 12), wname, fill=(255, 255, 255, 255), font=font_sm)
            draw.text((mx + 60, wy + 38), wdesc, fill=(160, 165, 190, 220), font=font_badge)
            
        # Cursor clicking Freighter
        cur_x = int(mx + m_w//2 + (t - 1.5) * 50) if t > 1.5 else mx + m_w//2
        cur_y = my + 160
        draw.ellipse([cur_x - 10, cur_y - 10, cur_x + 10, cur_y + 10], fill=(255, 255, 255, 200), outline=(140, 82, 255, 255), width=2)
    else:
        # Connected Success Banner
        draw.rounded_rectangle([w//2 - 280, 200, w//2 + 280, 260], radius=14, fill=(52, 211, 153, 30), outline=(52, 211, 153, 180), width=1)
        draw.text((w//2 - 230, 218), "✓ Wallet Connected: GABC...XYZ1 (10,000 XLM)", fill=(52, 211, 153, 255), font=font_sm)
        
    return img

def render_scene_4(t, dur):
    """Scene 4: Interactive 64x64 Canvas, Zoom/Pan & Color Palette."""
    img = create_gradient_canvas()
    draw = ImageDraw.Draw(img)
    font_title, font_sub, font_badge, font_code, font_sm = get_fonts()
    w, h = 1920, 1080
    draw_top_nav(img, connected=True)
    
    # Left Sidebar Navigation
    draw.rounded_rectangle([60, 120, 260, 780], radius=16, fill=(18, 20, 36, 200), outline=(255, 255, 255, 25), width=1)
    sidebar_items = ["🎨 Canvas", "🏆 Leaderboard", "👤 Profile", "⚙️ Settings"]
    sy = 160
    for sitem in sidebar_items:
        draw.text((90, sy), sitem, fill=(255, 255, 255, 255) if "Canvas" in sitem else (160, 165, 190, 220), font=font_sm)
        sy += 60
        
    # Main Canvas Area (Simulated 64x64 Grid with Zoom)
    zoom = 1.0 + min(t * 0.35, 1.8)
    cx, cy = 800, 440
    grid_size = int(480 * zoom)
    gx1, gy1 = cx - grid_size//2, cy - grid_size//2
    gx2, gy2 = cx + grid_size//2, cy + grid_size//2
    
    # Canvas Frame
    draw.rounded_rectangle([gx1 - 8, gy1 - 8, gx2 + 8, gy2 + 8], radius=12, fill=(12, 14, 26, 255), outline=(140, 82, 255, 100), width=2)
    
    # Generate colorful pixel art on the grid
    np.random.seed(42)
    rows, cols = 32, 32
    cell_w = grid_size / cols
    colors = [(140, 82, 255), (0, 245, 255), (245, 158, 11), (239, 68, 68), (52, 211, 153), (30, 34, 55)]
    for r in range(rows):
        for c in range(cols):
            if (r - 16)**2 + (c - 16)**2 < 120:
                col = colors[(r * 7 + c * 13) % len(colors)]
            else:
                col = colors[5]
            px1 = int(gx1 + c * cell_w)
            py1 = int(gy1 + r * cell_w)
            px2 = int(px1 + cell_w)
            py2 = int(py1 + cell_w)
            draw.rectangle([px1, py1, px2 - 1, py2 - 1], fill=col)
            
    # Hover Coordinate Box (32, 32)
    target_px = int(gx1 + 16 * cell_w)
    target_py = int(gy1 + 16 * cell_w)
    draw.rectangle([target_px, target_py, int(target_px + cell_w), int(target_py + cell_w)], outline=(255, 255, 255, 255), width=2)
    draw.rounded_rectangle([target_px + 20, target_py - 35, target_px + 140, target_py - 5], radius=6, fill=(0, 0, 0, 220), outline=(140, 82, 255, 200))
    draw.text((target_px + 30, target_py - 30), "(32, 32)", fill=(0, 245, 255, 255), font=font_badge)
    
    # Right Sidebar Mini Leaderboard
    draw.rounded_rectangle([1340, 120, 1860, 780], radius=16, fill=(18, 20, 36, 200), outline=(255, 255, 255, 25), width=1)
    draw.text((1370, 150), "Live Activity Feed", fill=(255, 255, 255, 255), font=font_sm)
    draw.ellipse([1810, 156, 1820, 166], fill=(52, 211, 153, 255))
    
    # Bottom Floating Color Picker Toolbar
    draw.rounded_rectangle([420, 730, 1180, 800], radius=16, fill=(20, 22, 40, 240), outline=(140, 82, 255, 120), width=1)
    draw.text((445, 752), "Colors:", fill=(200, 205, 225, 255), font=font_badge)
    preset_cols = [(140, 82, 255), (0, 245, 255), (52, 211, 153), (245, 158, 11), (239, 68, 68), (236, 72, 153), (255, 255, 255)]
    px_start = 525
    for pcol in preset_cols:
        draw.ellipse([px_start, 745, px_start + 30, 775], fill=pcol, outline=(255, 255, 255, 150), width=1)
        px_start += 45
    draw.rounded_rectangle([920, 742, 1150, 780], radius=8, fill=(10, 12, 24, 200), outline=(0, 245, 255, 180))
    draw.text((940, 750), "Hex: #00F5FF", fill=(0, 245, 255, 255), font=font_badge)
    
    return img

def render_scene_5(t, dur):
    """Scene 5: Paint Pixel Transaction & Testnet Settlement."""
    img = create_gradient_canvas()
    draw = ImageDraw.Draw(img)
    font_title, font_sub, font_badge, font_code, font_sm = get_fonts()
    w, h = 1920, 1080
    draw_top_nav(img, connected=True)
    
    # Main Canvas view
    draw.rounded_rectangle([340, 170, 1140, 720], radius=16, fill=(12, 14, 26, 255), outline=(140, 82, 255, 80), width=1)
    
    # Draw painted pixels
    for i in range(16):
        for j in range(16):
            draw.rectangle([400 + i*40, 220 + j*28, 438 + i*40, 246 + j*28], fill=(25, 28, 48, 255))
            
    # Coordinate (32, 32)
    target_rect = [680, 416, 718, 442]
    
    # Stages: 0-1.5s = Signing, 1.5-3.0s = Submitting, 3.0s+ = Success Confirmed
    if t < 1.8:
        # Signing state
        draw.rounded_rectangle([450, 120, 1030, 175], radius=12, fill=(140, 82, 255, 30), outline=(140, 82, 255, 180), width=1)
        draw.text((480, 138), "⏳ Open Freighter wallet to sign transaction...", fill=(220, 200, 255, 255), font=font_sm)
        # Freighter Popup Preview
        draw.rounded_rectangle([1200, 200, 1680, 520], radius=16, fill=(20, 24, 45, 240), outline=(140, 82, 255, 200), width=2)
        draw.text((1230, 230), "Freighter — Confirm Invocation", fill=(255, 255, 255, 255), font=font_sm)
        draw.text((1230, 280), "Contract: paint_pixel(32, 32, #00F5FF)", fill=(0, 245, 255, 255), font=font_badge)
        draw.text((1230, 320), "Network Fee: 0.00001 XLM", fill=(180, 185, 210, 255), font=font_badge)
        draw.rounded_rectangle([1230, 420, 1650, 480], radius=12, fill=(140, 82, 255, 230))
        draw.text((1390, 440), "Approve ➔", fill=(255, 255, 255, 255), font=font_sm)
    elif t < 3.2:
        # Submitting state
        draw.rounded_rectangle([450, 120, 1030, 175], radius=12, fill=(0, 245, 255, 30), outline=(0, 245, 255, 180), width=1)
        draw.text((480, 138), "⚡ Submitting to Stellar Soroban Testnet...", fill=(0, 245, 255, 255), font=font_sm)
    else:
        # Success Confirmed!
        draw.rounded_rectangle([target_rect[0], target_rect[1], target_rect[2], target_rect[3]], fill=(0, 245, 255, 255))
        draw.rounded_rectangle([450, 120, 1030, 175], radius=12, fill=(52, 211, 153, 30), outline=(52, 211, 153, 200), width=1)
        draw.text((480, 138), "✓ Confirmed! Tx: 7a9f...b12 (stellar.expert)", fill=(52, 211, 153, 255), font=font_sm)
        
    return img

def render_scene_6(t, dur):
    """Scene 6: Real-Time Event Streaming & Activity Feed."""
    img = create_gradient_canvas()
    draw = ImageDraw.Draw(img)
    font_title, font_sub, font_badge, font_code, font_sm = get_fonts()
    w, h = 1920, 1080
    draw_top_nav(img, connected=True)
    
    # Left Preview
    draw.rounded_rectangle([60, 120, 860, 780], radius=16, fill=(15, 17, 30, 200), outline=(255, 255, 255, 25), width=1)
    draw.text((100, 160), "Decentralized Event Streaming", fill=(255, 255, 255, 255), font=font_title)
    draw.text((100, 230), "• Polling Soroban RPC getEvents() every 3s", fill=(0, 245, 255, 255), font=font_sm)
    draw.text((100, 280), "• Independent pagination cursors per contract", fill=(190, 195, 220, 255), font=font_sm)
    draw.text((100, 330), "• Zero server backend required", fill=(52, 211, 153, 255), font=font_sm)
    
    # Right Sidebar Event Stream (Full focus)
    draw.rounded_rectangle([920, 120, 1860, 780], radius=18, fill=(20, 23, 44, 240), outline=(140, 82, 255, 150), width=2)
    draw.text((960, 160), "Live Activity Stream", fill=(255, 255, 255, 255), font=font_title)
    
    # Pulsing live indicator
    pulse_alpha = int(180 + 75 * math.sin(t * 5))
    draw.ellipse([1780, 168, 1796, 184], fill=(52, 211, 153, pulse_alpha))
    draw.text((1805, 164), "LIVE", fill=(52, 211, 153, 255), font=font_badge)
    
    events = [
        ("You painted coordinate (32, 32)", "Just now", (0, 245, 255)),
        ("GDR...4KL9 painted coordinate (33, 32)", "3s ago", (140, 82, 255)),
        ("GXYZ...88PA unlocked 'First Pixel'", "12s ago", (245, 158, 11)),
        ("GBB...771Q painted coordinate (15, 20)", "24s ago", (239, 68, 68)),
    ]
    ey = 240
    for etitle, etime, ecol in events:
        draw.rounded_rectangle([960, ey, 1820, ey + 75], radius=12, fill=(14, 16, 32, 220), outline=(255, 255, 255, 20), width=1)
        draw.ellipse([985, ey + 25, 1010, ey + 50], fill=ecol)
        draw.text((1030, ey + 18), etitle, fill=(255, 255, 255, 255), font=font_sm)
        draw.text((1030, ey + 44), f"Stellar Soroban Event • {etime}", fill=(160, 165, 190, 220), font=font_badge)
        ey += 95
        
    return img

def render_scene_7(t, dur):
    """Scene 7: Gamification: NFT Achievement Badges & Profile."""
    img = create_gradient_canvas()
    draw = ImageDraw.Draw(img)
    font_title, font_sub, font_badge, font_code, font_sm = get_fonts()
    w, h = 1920, 1080
    draw_top_nav(img, connected=True)
    
    # Profile Header Card
    draw.rounded_rectangle([120, 120, 1800, 260], radius=18, fill=(20, 23, 44, 220), outline=(140, 82, 255, 120), width=1)
    draw.ellipse([160, 150, 230, 220], fill=(140, 82, 255, 255))
    draw.text((260, 155), "GABC...XYZ1 (Your Profile)", fill=(255, 255, 255, 255), font=font_title)
    draw.text((260, 210), "Rank #8  •  1 Pixel Painted  •  1 Badge Unlocked", fill=(0, 245, 255, 255), font=font_sm)
    
    # Badges Grid
    draw.text((120, 300), "NFT Achievement Badges", fill=(255, 255, 255, 255), font=font_title)
    
    badges = [
        ("First Pixel", "Paint your first pixel on canvas", "UNLOCKED ★", (140, 82, 255, 70), (140, 82, 255, 255), 120),
        ("Pixel Artist", "Paint 10 pixels on canvas", "1 / 10 Pixels", (18, 20, 36, 200), (255, 255, 255, 40), 540),
        ("Pixel Master", "Paint 100 pixels on canvas", "1 / 100 Pixels", (18, 20, 36, 200), (255, 255, 255, 40), 960),
        ("Top 10", "Reach top 10 on the leaderboard", "Rank #8 (Active)", (245, 158, 11, 60), (245, 158, 11, 200), 1380),
    ]
    for bname, bdesc, bstatus, bg, bord, bx in badges:
        draw.rounded_rectangle([bx, 360, bx + 380, 520], radius=16, fill=bg, outline=bord, width=2 if "UNLOCKED" in bstatus else 1)
        draw.text((bx + 25, 385), bname, fill=(255, 255, 255, 255), font=font_sm)
        draw.text((bx + 25, 430), bdesc, fill=(160, 165, 190, 240), font=font_badge)
        draw.text((bx + 25, 475), bstatus, fill=(245, 158, 11, 255) if "★" in bstatus else (0, 245, 255, 255), font=font_badge)
        
    # Recent Activity Table
    draw.text((120, 560), "Recent On-Chain Activity", fill=(255, 255, 255, 255), font=font_title)
    draw.rounded_rectangle([120, 610, 1800, 780], radius=16, fill=(16, 18, 34, 200), outline=(255, 255, 255, 25), width=1)
    draw.text((150, 640), "Painted (32, 32) • Color: #00F5FF • Tx: 7a9f...b12 • Stellar Soroban Ledger #492812", fill=(200, 205, 230, 255), font=font_sm)
    
    return img

def render_scene_8(t, dur):
    """Scene 8: Live On-Chain Leaderboard."""
    img = create_gradient_canvas()
    draw = ImageDraw.Draw(img)
    font_title, font_sub, font_badge, font_code, font_sm = get_fonts()
    w, h = 1920, 1080
    draw_top_nav(img, connected=True)
    
    # Leaderboard Header & User Banner
    draw.text((160, 130), "Live On-Chain Leaderboard", fill=(255, 255, 255, 255), font=font_title)
    
    # User Highlight Banner
    draw.rounded_rectangle([160, 190, 1760, 260], radius=14, fill=(140, 82, 255, 40), outline=(140, 82, 255, 200), width=1)
    draw.text((190, 210), "Your Rank: #8  |  Address: GABC...XYZ1  |  Score: 1 Pixel Painted", fill=(255, 255, 255, 255), font=font_sm)
    
    # Table Header
    draw.rounded_rectangle([160, 280, 1760, 740], radius=16, fill=(18, 21, 40, 220), outline=(255, 255, 255, 30), width=1)
    draw.text((200, 310), "RANK", fill=(140, 82, 255, 255), font=font_badge)
    draw.text((380, 310), "PLAYER ADDRESS", fill=(140, 82, 255, 255), font=font_badge)
    draw.text((1050, 310), "PIXELS PAINTED", fill=(140, 82, 255, 255), font=font_badge)
    draw.text((1450, 310), "BADGES", fill=(140, 82, 255, 255), font=font_badge)
    
    # Rows
    rows = [
        ("🥇 Rank 1", "GDOM...992A", "142 Pixels", "Pixel Master 👑", (245, 158, 11)),
        ("🥈 Rank 2", "GCRY...114K", "98 Pixels", "Pixel Artist", (200, 205, 225)),
        ("🥉 Rank 3", "GAST...772M", "64 Pixels", "Pixel Artist", (217, 119, 6)),
        ("  Rank 8", "GABC...XYZ1 (You)", "1 Pixel", "First Pixel ★", (0, 245, 255)),
    ]
    ry = 370
    for rrank, raddr, rscore, rbadge, rcol in rows:
        draw.line([180, ry - 10, 1740, ry - 10], fill=(255, 255, 255, 15), width=1)
        draw.text((200, ry), rrank, fill=rcol, font=font_sm)
        draw.text((380, ry), raddr, fill=(255, 255, 255, 255), font=font_sm)
        draw.text((1050, ry), rscore, fill=(0, 245, 255, 255), font=font_sm)
        draw.text((1450, ry), rbadge, fill=rcol, font=font_sm)
        ry += 75
        
    return img

def render_scene_9(t, dur):
    """Scene 9: Smart Contract Architecture & Testing (Cargo 18/18)."""
    img = create_gradient_canvas()
    draw = ImageDraw.Draw(img)
    font_title, font_sub, font_badge, font_code, font_sm = get_fonts()
    w, h = 1920, 1080
    draw_top_nav(img, connected=False)
    
    # Split Screen: Left = Rust Code, Right = Cargo Test Terminal
    draw.text((120, 130), "Smart Contract Optimization & 100% Test Coverage", fill=(255, 255, 255, 255), font=font_title)
    
    # Left: Code Window
    draw.rounded_rectangle([120, 190, 920, 750], radius=16, fill=(14, 16, 28, 240), outline=(140, 82, 255, 150), width=1)
    draw.text((150, 215), "contracts/pixel/src/lib.rs (Row Slicing)", fill=(140, 82, 255, 255), font=font_sm)
    
    code_lines = [
        "// Respects 100-entry persistent read budget",
        "pub fn get_canvas_slice(env: Env, row: u32)",
        "    -> Vec<Pixel> {",
        "    let mut slice = Vec::new(&env);",
        "    for col in 0..64 {",
        "        let key = DataKey::Pixel(row, col);",
        "        let pixel = env.storage()",
        "            .persistent()",
        "            .get(&key)",
        "            .unwrap_or(Pixel::default());",
        "        slice.push_back(pixel);",
        "    }",
        "    slice",
        "}"
    ]
    cy = 270
    for cline in code_lines:
        col = (100, 150, 255) if "fn" in cline or "pub" in cline else (200, 210, 235)
        if "//" in cline: col = (100, 110, 140)
        draw.text((150, cy), cline, fill=col, font=font_code)
        cy += 32
        
    # Right: Cargo Test Terminal Output
    draw.rounded_rectangle([960, 190, 1800, 750], radius=16, fill=(10, 12, 22, 240), outline=(52, 211, 153, 150), width=1)
    draw.text((990, 215), "terminal: cargo test --workspace", fill=(52, 211, 153, 255), font=font_sm)
    
    term_lines = [
        "   Compiling pixel v0.1.0 (contracts/pixel)",
        "   Compiling leaderboard v0.1.0 (contracts/leaderboard)",
        "   Compiling achievement v0.1.0 (contracts/achievement)",
        "    Finished `test` profile [unoptimized + debuginfo]",
        "     Running unittests src/lib.rs",
        "",
        "test tests::test_paint_pixel ... ok",
        "test tests::test_get_canvas_slice ... ok",
        "test tests::test_leaderboard_scoring ... ok",
        "test tests::test_award_badges ... ok",
        "test tests::test_unauthorized_paint ... ok",
        "",
        "test result: ok. 18 passed; 0 failed; 0 ignored"
    ]
    ty = 270
    for tline in term_lines:
        tcol = (52, 211, 153) if "ok" in tline or "passed" in tline else (180, 185, 210)
        draw.text((990, ty), tline, fill=tcol, font=font_code)
        ty += 32
        
    return img

def render_scene_10(t, dur):
    """Scene 10: Conclusion & Call to Action."""
    img = create_gradient_canvas()
    draw = ImageDraw.Draw(img)
    font_title, font_sub, font_badge, font_code, font_sm = get_fonts()
    w, h = 1920, 1080
    draw_top_nav(img, connected=True)
    
    # Grand Title Card
    draw.ellipse([w//2 - 40, 200, w//2 + 40, 280], fill=(140, 82, 255, 255))
    draw.text((w//2 - 170, 310), "StellarCanvas", fill=(255, 255, 255, 255), font=font_title)
    draw.text((w//2 - 340, 375), "Collaborative Digital Canvas on Stellar Soroban", fill=(180, 185, 215, 255), font=font_sub)
    
    # Links Cards
    links = [
        ("🌐 Live Demo Application", "stellar-canvas.vercel.app", 380, (0, 245, 255, 60), (0, 245, 255, 200)),
        ("💻 GitHub Open Source", "github.com/d35r0n/StellarCanvas", 980, (140, 82, 255, 60), (140, 82, 255, 200)),
    ]
    for ltitle, lurl, lx, lbg, lbord in links:
        draw.rounded_rectangle([lx, 470, lx + 560, 600], radius=18, fill=lbg, outline=lbord, width=2)
        draw.text((lx + 35, 500), ltitle, fill=(255, 255, 255, 255), font=font_sm)
        draw.text((lx + 35, 545), lurl, fill=(255, 255, 255, 255), font=font_badge)
        
    # Closing Punchline
    draw.text((w//2 - 270, 670), "Connect your wallet and claim your pixel today.", fill=(52, 211, 153, 255), font=font_sm)
    
    return img

SCENE_RENDERERS = {
    "scene_1": render_scene_1,
    "scene_2": render_scene_2,
    "scene_3": render_scene_3,
    "scene_4": render_scene_4,
    "scene_5": render_scene_5,
    "scene_6": render_scene_6,
    "scene_7": render_scene_7,
    "scene_8": render_scene_8,
    "scene_9": render_scene_9,
    "scene_10": render_scene_10,
}

# ----------------------------------------------------------------------
# 6. Video Compilation Pipeline (30 FPS 1080p MP4)
# ----------------------------------------------------------------------
def render_all_scene_videos():
    fps = 30
    scene_video_files = []
    
    # Sound Effects
    sfx_chime = generate_sfx("chime.wav", "chime")
    sfx_click = generate_sfx("click.wav", "click")
    sfx_whoosh = generate_sfx("whoosh.wav", "whoosh")
    sfx_fanfare = generate_sfx("fanfare.wav", "fanfare")
    
    print("\n🎬 Rendering 1080p Video Scenes (1920x1080 @ 30 FPS)...")
    
    total_progress = 0
    total_scenes_duration = sum(s["duration"] for s in SCENES)
    
    for s_idx, scene in enumerate(SCENES):
        sid = scene["id"]
        dur = scene["duration"]
        num_frames = int(dur * fps)
        renderer = SCENE_RENDERERS[sid]
        
        frames_dir = os.path.join(ASSETS_DIR, f"frames_{sid}")
        os.makedirs(frames_dir, exist_ok=True)
        
        print(f"  Rendering {sid} ({num_frames} frames, {dur:.2f}s)...")
        for f in range(num_frames):
            t = f / fps
            prog = (total_progress + t) / total_scenes_duration
            frame_img = renderer(t, dur)
            # Add dynamic HUD / subtitle / progress bar overlays
            draw_hud_overlays(frame_img, scene, progress_ratio=prog)
            
            frame_path = os.path.join(frames_dir, f"frame_{f:05d}.png")
            frame_img.save(frame_path, "PNG")
            
        total_progress += dur
        
        # Audio composition for this scene
        scene_raw_vid = os.path.join(ASSETS_DIR, f"{sid}_video.mp4")
        voice_wav = scene["audio_wav"]
        
        # Add SFX depending on scene
        if sid in ["scene_3", "scene_5"]:
            chosen_sfx = sfx_chime
        elif sid in ["scene_7"]:
            chosen_sfx = sfx_fanfare
        else:
            chosen_sfx = sfx_whoosh
            
        # Combine frames + voiceover + SFX using FFmpeg
        scene_audio_mixed = os.path.join(ASSETS_DIR, f"{sid}_audio.wav")
        cmd_amix = [
            "ffmpeg", "-y",
            "-i", voice_wav,
            "-i", chosen_sfx,
            "-filter_complex", "[0:a]volume=1.0[a0];[1:a]volume=0.35[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[aout]",
            "-map", "[aout]",
            scene_audio_mixed
        ]
        subprocess.run(cmd_amix, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        
        # Assemble Video Clip with x264 & aac
        cmd_v = [
            "ffmpeg", "-y",
            "-framerate", str(fps),
            "-i", os.path.join(frames_dir, "frame_%05d.png"),
            "-i", scene_audio_mixed,
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "fast",
            "-crf", "18",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            scene_raw_vid
        ]
        subprocess.run(cmd_v, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        scene_video_files.append(scene_raw_vid)
        print(f"  ✓ Finished {sid} -> {scene_raw_vid}")

    return scene_video_files, total_scenes_duration

def concatenate_and_master_final_video(scene_videos, total_duration):
    print("\n🎵 Generating Cyberpunk Ambient Background Music & Mastering Final Video...")
    bg_music_wav = os.path.join(ASSETS_DIR, "ambient_lofi.wav")
    generate_ambient_music(total_duration + 5.0, bg_music_wav)
    
    # Create FFmpeg concat list
    concat_txt = os.path.join(ASSETS_DIR, "concat_list.txt")
    with open(concat_txt, "w") as f:
        for vid in scene_videos:
            f.write(f"file '{vid}'\n")
            
    temp_concat_mp4 = os.path.join(ASSETS_DIR, "temp_concat.mp4")
    cmd_concat = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_txt,
        "-c", "copy",
        temp_concat_mp4
    ]
    subprocess.run(cmd_concat, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    # Master final audio mix (Concatenated Audio + Ambient Music ducked at -22dB)
    print("🎬 Finalizing 1080p MP4 with Master Audio Mix...")
    cmd_final = [
        "ffmpeg", "-y",
        "-i", temp_concat_mp4,
        "-i", bg_music_wav,
        "-filter_complex",
        "[0:a]volume=1.0[voice];[1:a]volume=0.18[music];[voice][music]amix=inputs=2:duration=first:dropout_transition=3[aout]",
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "256k",
        FINAL_VIDEO_PATH
    ]
    subprocess.run(cmd_final, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    # Copy to project root as well
    subprocess.run(["cp", FINAL_VIDEO_PATH, ROOT_VIDEO_PATH], check=True)
    print(f"\n🎉 Master 1080p Demo Video Successfully Created!\n📁 Location: {FINAL_VIDEO_PATH}\n📁 Root: {ROOT_VIDEO_PATH}")

def main():
    start_time = time.time()
    generate_voiceovers()
    scene_videos, total_dur = render_all_scene_videos()
    concatenate_and_master_final_video(scene_videos, total_dur)
    elapsed = time.time() - start_time
    print(f"\n✨ Total Pipeline Execution Time: {elapsed:.1f}s")

if __name__ == "__main__":
    main()
