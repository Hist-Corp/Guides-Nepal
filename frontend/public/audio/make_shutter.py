import numpy as np
import wave

# ---------------------------------------------------------------------------
# Professional camera-shutter sound: layered design
#   Layer 1 – Sharp mechanical click (broadband percussive burst):
#       Very fast attack (~1 ms) + exponential decay, shaped to avoid
#       spectral leakage. This is the "snap" the user hears.
#   Layer 2 – Lens "whoosh" (narrowband noise, 2–4 kHz sweep):
#       A brief broadband sweep that simulates the lens barrel movement.
#   Layer 3 – Subtle resonance tail (damped sine, 3–6 kHz):
#       Gives the sound a natural "thunk" tail rather than a raw click.
# ---------------------------------------------------------------------------

SAMPLE_RATE = 48000          # Broadcast-quality sample rate
DURATION = 0.45               # Total duration ~450 ms
NUM_SAMPLES = int(SAMPLE_RATE * DURATION)
t = np.linspace(0, DURATION, NUM_SAMPLES, endpoint=False)

# --- Envelopes -------------------------------------------------------------
# Global fast attack + smooth decay
def envelope_fast_decay(attack_ms=6, decay_ms=300):
    attack_samples = int(SAMPLE_RATE * attack_ms / 1000)
    decay_samples = int(SAMPLE_RATE * decay_ms / 1000)
    env = np.zeros(NUM_SAMPLES)
    env[:attack_samples] = np.linspace(0, 1, attack_samples, endpoint=False)
    decay_len = NUM_SAMPLES - attack_samples
    if decay_len > 0:
        env[attack_samples:] = np.exp(-np.linspace(0, 1, decay_len) * 4.0)
    return env

# Click-specific envelope: ultra-fast attack, sharp decay
def envelope_click(attack_ms=2, decay_ms=120):
    attack_samples = int(SAMPLE_RATE * attack_ms / 1000)
    decay_samples = int(SAMPLE_RATE * decay_ms / 1000)
    env = np.zeros(NUM_SAMPLES)
    env[:attack_samples] = np.linspace(0, 1, attack_samples, endpoint=False)
    decay_len = NUM_SAMPLES - attack_samples
    if decay_len > 0:
        # Slightly steeper decay for a 'snap' character
        env[attack_samples:] = np.exp(-np.linspace(0, 3.0, decay_len) * 3.0)
    return env

# Whoosh envelope: rises quickly then falls slowly (sweep character)
def envelope_whoosh():
    # Ramp up over 30 ms, then exponential decay over 400 ms
    ramp = int(SAMPLE_RATE * 0.03)
    env = np.zeros(NUM_SAMPLES)
    if ramp > 0:
        env[:ramp] = np.linspace(0, 1, ramp, endpoint=False)
    decay_len = NUM_SAMPLES - ramp
    if decay_len > 0:
        env[ramp:] = np.exp(-np.linspace(0, 1, decay_len) * 2.0)
    return env

# --- Layer 1: Click --------------------------------------------------------
click_env = envelope_click()
# Broadband noise for the click
click_noise = np.random.uniform(-1.0, 1.0, NUM_SAMPLES)
# Apply steep spectral rolloff (high-pass-ish) to keep it tight
click_spectrum = np.fft.rfft(click_noise)
freqs = np.fft.rfftfreq(NUM_SAMPLES, 1 / SAMPLE_RATE)
# Boost 1–4 kHz, attenuate >8 kHz (mechanical click character)
click_spectrum[(freqs < 1000) | (freqs > 8000)] *= 0.2
click_noise = np.fft.irfft(click_spectrum, n=NUM_SAMPLES)
click = click_noise * click_env

# --- Layer 2: Whoosh -------------------------------------------------------
whoosh_env = envelope_whoosh()
# Narrowband noise around 2.5–4 kHz (lens barrel movement)
whoosh = np.random.uniform(-1.0, 1.0, NUM_SAMPLES)
whoosh_spectrum = np.fft.rfft(whoosh)
whoosh_freqs = np.fft.rfftfreq(NUM_SAMPLES, 1 / SAMPLE_RATE)
whoosh_band = (whoosh_freqs > 2000) & (whoosh_freqs < 5000)
whoosh_spectrum[~whoosh_band] = 0
whoosh_noise = np.fft.irfft(whoosh_spectrum, n=NUM_SAMPLES)
# Slight upward sweep via time-varying phase (implemented as a simple
# resampling of the noise buffer to simulate a ~1–2 kHz rise)
whoosh_swept = whoosh_noise * np.linspace(0.8, 1.2, NUM_SAMPLES) + 0.3 * np.roll(whoosh_noise, -int(NUM_SAMPLES * 0.05))
whoosh = whoosh_swept * whoosh_env

# --- Layer 3: Resonance tail -----------------------------------------------
tail_env = envelope_fast_decay(attack_ms=10, decay_ms=500)
tail_freqs = np.array([3000.0, 4500.0, 6000.0])
tail_amplitudes = np.array([0.3, 0.2, 0.1])
tail = np.zeros(NUM_SAMPLES)
for f, a in zip(tail_freqs, tail_amplitudes):
    tail += a * np.sin(2 * np.pi * f * t)
tail = tail * tail_env

# --- Mix & Normalize -----------------------------------------------------
mix = 0.7 * click + 0.4 * whoosh + 0.5 * tail
# Normalize to 0 dBFS (peak = 1.0)
peak = np.max(np.abs(mix))
if peak > 0:
    mix = mix / peak
# Apply a gentle 0.5 ms fade-in to avoid any DC click on the very first sample
fade_in = int(SAMPLE_RATE * 0.0005)
mix[:fade_in] *= np.linspace(0, 1, fade_in)

# Write as 16-bit PCM WAV
MONO = mix.astype(np.float32)
with wave.open("shutter.wav", "w") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes((MONO * 32767).astype(np.int16).tobytes())

print("Created shutter.wav:", NUM_SAMPLES, "samples,", SAMPLE_RATE, "Hz")
print("Peak amplitude:", np.max(np.abs(MONO)))

