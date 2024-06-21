import { jsPDF } from "jspdf";
import { toast } from 'sonner';
import { domToJpeg, domToPng, domToSvg } from 'modern-screenshot'

export const exportToPdf = async () => {
  try {
    const screenShot = document.querySelector("#canvas") as HTMLElement;
    domToPng(screenShot, { 
      quality: 1,
      scale: 3,
      backgroundColor: '#F4F4F4',
    }).then((dataUrl) => {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [screenShot.clientWidth, screenShot.clientHeight]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, screenShot.clientWidth, screenShot.clientHeight);
      pdf.save(`board.pdf`);
    });
  } catch (error) {
    toast.error('An error occurred while exporting the board. Please try a different browser.');
  }
};

export const exportToPNG = async () => {
  try {
    const screenShot = document.querySelector("#canvas") as HTMLElement;
    domToPng(screenShot, {
      quality: 1,
      scale: 3,
      backgroundColor: '#F4F4F4',
    }).then((dataUrl) => {
      var anchor = document.createElement("a");
      anchor.setAttribute("href", dataUrl);
      anchor.setAttribute("download", `board.png`);
      anchor.click();
      anchor.remove();
    })
  } catch (error) {
    toast.error('An error occurred while exporting the board. Please try a different browser.');
  }
};

export const exportToJPG = async () => {
  try {
    const screenShot = document.querySelector("#canvas") as HTMLElement;
    domToJpeg(screenShot, {
      quality: 1,
      scale: 3,
      backgroundColor: '#F4F4F4',
    }).then((dataUrl) => {
      var anchor = document.createElement("a");
      anchor.setAttribute("href", dataUrl);
      anchor.setAttribute("download", `board.jpg`);
      anchor.click();
      anchor.remove();
    })
  } catch (error) {
    toast.error('An error occurred while exporting the board. Please try a different browser.');
  }
};

export const exportToSVG = async () => {
  try {
    const screenShot = document.querySelector("#canvas") as HTMLElement;
    domToSvg(screenShot, {
      quality: 1,
      scale: 3,
      backgroundColor: '#F4F4F4',
    }).then((dataUrl) => {
      var anchor = document.createElement("a");
      anchor.setAttribute("href", dataUrl);
      anchor.setAttribute("download", `board.svg`);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    })
  } catch (error) {
    toast.error('An error occurred while exporting the board. Please try a different browser.');
  }
};