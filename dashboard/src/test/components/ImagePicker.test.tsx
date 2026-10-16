import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImagePicker from '../../components/ImagePicker';

// Mock the media API so upload mode never hits the network.
vi.mock('../../services/api', () => ({
  uploadMedia: vi.fn(async () => ({ url: 'https://cdn.example.com/x.jpg', id: 7 })),
  uploadMediaFromUrl: vi.fn(async () => ({ url: 'https://cdn.example.com/from-url.jpg', id: 9 })),
}));

// Mock the compressor to bypass canvas/createImageBitmap (unavailable in jsdom).
vi.mock('../../utils/imageCompressor', () => ({
  compressImage: vi.fn(async (file: File) => ({
    file,
    originalSize: file.size,
    compressedSize: file.size,
    wasCompressed: false,
    reductionPercent: 0,
  })),
  fetchImageAsFile: vi.fn(async () => new File(['x'], 'remote.jpg', { type: 'image/jpeg' })),
  formatBytes: vi.fn((b: number) => `${b} B`),
}));

describe('ImagePicker (consolidated)', () => {
  it('renders deferred mode with device/URL buttons when onSelect is provided', () => {
    render(<ImagePicker onSelect={() => {}} buttonText="Pick image" />);
    expect(screen.getByText('Pick image')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /from device/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /from url/i })).toBeInTheDocument();
  });

  it('renders upload mode with tabs and label when onImageSelected is provided', () => {
    render(<ImagePicker onImageSelected={() => {}} label="Featured" />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /from device/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /from url/i })).toBeInTheDocument();
  });

  it('calls onSelect with a File (deferred contract) on device pick', async () => {
    const onSelect = vi.fn(async (_file: File) => {});
    render(<ImagePicker onSelect={onSelect} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    // Wrap in act: the pick triggers async compression + a setLoading state
    // update, which React wants flushed inside act() during tests.
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toBeInstanceOf(File);
  });

  it('shows the preview + clear affordance when previewUrl is supplied (deferred)', () => {
    render(
      <ImagePicker
        onSelect={() => {}}
        previewUrl="https://cdn.example.com/p.jpg"
        onClear={() => {}}
      />
    );
    const img = screen.getByAltText('Selected') as HTMLImageElement;
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/p.jpg');
  });
});
