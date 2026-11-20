/**
 * PicDF - UI Controller & Event Binding
 */
(function() {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previewGrid = document.getElementById('previewGrid');
  const generateBtn = document.getElementById('generateBtn');
  const clearBtn = document.getElementById('clearBtn');
  const previewBtn = document.getElementById('previewBtn');
  const fileStats = document.getElementById('fileStats');
  const statusMsg = document.getElementById('statusMsg');

  // Preview Modal Elements
  const previewModal = document.getElementById('previewModal');
  const modalViewerImg = document.getElementById('modalViewerImg');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const pageNavIndicator = document.getElementById('pageNavIndicator');

  let imagesData = [];
  let modalCurrentIndex = 0;

  // File loading
  function handleFiles(files) {
    if (!files || !files.length) return;
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (!validFiles.length) {
      alert("Chỉ chấp nhận các tệp định dạng hình ảnh (JPG, PNG, WEBP, GIF, SVG).");
      return;
    }

    let loadedCount = 0;
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagesData.push({
          id: 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          src: e.target.result,
          name: file.name,
          size: file.size,
          rotation: 0
        });
        loadedCount++;
        if (loadedCount === validFiles.length) {
          renderPreview();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPreview() {
    previewGrid.innerHTML = '';
    const totalCount = imagesData.length;
    if (fileStats) {
      fileStats.textContent = totalCount === 0 ? "Chưa có ảnh nào được chọn" : `Đã chọn ${totalCount} ảnh`;
    }
    const previewHeaderBar = document.getElementById('previewHeaderBar');
    if (previewHeaderBar) {
      previewHeaderBar.style.display = totalCount > 0 ? 'flex' : 'none';
    }
    if (clearBtn) {
      clearBtn.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    }
    if (previewBtn) {
      previewBtn.style.display = totalCount > 0 ? 'inline-flex' : 'none';
      previewBtn.disabled = totalCount === 0;
    }
    if (generateBtn) {
      generateBtn.disabled = totalCount === 0;
    }

    imagesData.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'card-item';
      card.draggable = true;
      card.dataset.id = item.id;

      card.innerHTML = `
        <div class="card-thumb-wrap">
          <img src="${item.src}" alt="${item.name}" style="transform: rotate(${item.rotation}deg);">
          <div class="card-badge">#${index + 1}</div>
        </div>
        <div class="card-title" title="${item.name}">${item.name}</div>
        <div class="card-actions">
          <button type="button" class="btn-card-action btn-move-left" title="Di chuyển lên trước" ${index === 0 ? 'disabled' : ''}>
            <i class="fas fa-arrow-left"></i>
          </button>
          <button type="button" class="btn-card-action btn-rotate" title="Xoay 90 độ">
            <i class="fas fa-rotate-right"></i>
          </button>
          <button type="button" class="btn-card-action btn-move-right" title="Di chuyển về sau" ${index === totalCount - 1 ? 'disabled' : ''}>
            <i class="fas fa-arrow-right"></i>
          </button>
          <button type="button" class="btn-card-action btn-delete" title="Xóa ảnh này">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      // Card event listeners
      card.querySelector('.btn-rotate').onclick = () => {
        item.rotation = (item.rotation + 90) % 360;
        renderPreview();
      };

      card.querySelector('.btn-delete').onclick = () => {
        imagesData.splice(index, 1);
        renderPreview();
      };

      card.querySelector('.btn-move-left').onclick = () => {
        if (index > 0) {
          const temp = imagesData[index];
          imagesData[index] = imagesData[index - 1];
          imagesData[index - 1] = temp;
          renderPreview();
        }
      };

      card.querySelector('.btn-move-right').onclick = () => {
        if (index < imagesData.length - 1) {
          const temp = imagesData[index];
          imagesData[index] = imagesData[index + 1];
          imagesData[index + 1] = temp;
          renderPreview();
        }
      };

      previewGrid.appendChild(card);
    });
  }

  // Live Modal Preview
  async function updateModalView(index) {
    if (imagesData.length === 0) return;
    if (index < 0) index = 0;
    if (index >= imagesData.length) index = imagesData.length - 1;
    modalCurrentIndex = index;

    pageNavIndicator.textContent = `Trang ${modalCurrentIndex + 1} / ${imagesData.length}`;
    prevPageBtn.disabled = modalCurrentIndex === 0;
    nextPageBtn.disabled = modalCurrentIndex === imagesData.length - 1;

    const filterType = document.getElementById('docFilterSelect').value;
    const processed = await ImageProcessor.processImage(imagesData[modalCurrentIndex], 0.9, filterType);
    modalViewerImg.src = processed.dataUrl;
  }

  // Event Listeners Wiring
  document.addEventListener('DOMContentLoaded', () => {
    // Dropzone Events
    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      handleFiles(fileInput.files);
      fileInput.value = '';
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, e => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, e => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', e => {
      handleFiles(e.dataTransfer.files);
    });

    // Clear All
    clearBtn.addEventListener('click', () => {
      if (imagesData.length === 0) return;
      if (confirm("Bạn có chắc chắn muốn xóa tất cả ảnh đã chọn?")) {
        imagesData = [];
        renderPreview();
      }
    });

    // Preview Modal Events
    previewBtn.addEventListener('click', () => {
      if (imagesData.length === 0) return;
      modalCurrentIndex = 0;
      updateModalView(0);
      previewModal.classList.add('open');
    });

    closeModalBtn.addEventListener('click', () => previewModal.classList.remove('open'));
    prevPageBtn.addEventListener('click', () => updateModalView(modalCurrentIndex - 1));
    nextPageBtn.addEventListener('click', () => updateModalView(modalCurrentIndex + 1));

    previewModal.addEventListener('click', e => {
      if (e.target === previewModal) previewModal.classList.remove('open');
    });

    // PDF Generation
    generateBtn.addEventListener('click', async () => {
      if (imagesData.length === 0) {
        alert("Vui lòng thêm ít nhất 1 ảnh trước khi xuất PDF!");
        return;
      }

      statusMsg.style.display = 'inline-block';
      statusMsg.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang biên dịch PDF...';
      generateBtn.disabled = true;

      try {
        const pageFormat = document.getElementById('pageSizeSelect').value;
        const orientationPref = document.getElementById('pageOrientationSelect').value;
        const margin = parseFloat(document.getElementById('pageMarginSelect').value) || 0;
        const quality = parseFloat(document.getElementById('imgQualitySelect').value) || 0.85;
        const filterType = document.getElementById('docFilterSelect').value;
        const watermark = document.getElementById('watermarkInput').value;
        const addPageNumbers = document.getElementById('addPageNumbersCheck').checked;

        const pdf = await PdfBuilder.generate(imagesData, {
          pageFormat,
          orientation: orientationPref,
          margin,
          quality,
          filterType,
          watermark,
          addPageNumbers
        });

        const customName = (document.getElementById('fileNameInput').value || '').trim();
        const now = new Date();
        const dateTag = now.toISOString().slice(0, 10).replace(/-/g, '');
        const filename = customName ? `${customName}.pdf` : `PicDF_export_${dateTag}.pdf`;

        pdf.save(filename);
        statusMsg.innerHTML = '<i class="fas fa-check" style="color:var(--success)"></i> Đã xuất thành công!';
        setTimeout(() => { statusMsg.style.display = 'none'; }, 3500);
      } catch (err) {
        console.error(err);
        alert("Đã xảy ra lỗi khi tạo tệp PDF: " + err.message);
        statusMsg.style.display = 'none';
      } finally {
        generateBtn.disabled = imagesData.length === 0;
      }
    });

    // Default filename with current date
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileNameInput = document.getElementById('fileNameInput');
    if (fileNameInput && !fileNameInput.value) {
      fileNameInput.value = `PicDF_${dateStr}`;
    }
  });
})();
