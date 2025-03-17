import { Document, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, HeadingLevel, ImageRun, Header, Footer, PageNumber, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, Packer } from 'docx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

// Hàm chuyển đổi ảnh base64 thành ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  try {
    // Kiểm tra xem chuỗi có phải là base64 không
    if (!base64 || !base64.includes(',')) {
      throw new Error('Invalid base64 string');
    }
    
    const binaryString = window.atob(base64.split(',')[1]);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error('Error converting base64 to ArrayBuffer:', error);
    return null;
  }
};

// Hàm tải ảnh từ URL và chuyển đổi thành ArrayBuffer
const fetchImageAsArrayBuffer = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

// Hàm định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).format('DD/MM/YYYY');
};

// Hàm tính tuổi từ ngày sinh
const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  return dayjs().diff(dayjs(birthDate), 'year');
};

// Hàm tạo file Word
export const generateElderlyWordDocument = async (elderly) => {
  try {
    if (!elderly) {
      throw new Error('Không có dữ liệu người cao tuổi');
    }
    
    // Xử lý trường hợp không có tên
    const elderlyName = elderly.name || 'Nguoi_cao_tuoi';
    
    // Xử lý ảnh
    let imageData = null;
    if (elderly.photoUrl) {
      if (elderly.photoUrl.includes('data:image')) {
        // Nếu là base64
        imageData = base64ToArrayBuffer(elderly.photoUrl);
      } else {
        // Nếu là URL
        imageData = await fetchImageAsArrayBuffer(elderly.photoUrl);
      }
    }
    
    // Lấy thông tin thôn/xã từ địa chỉ
    const getVillageAndCommune = (address) => {
      if (!address) return { village: '', commune: '' };
      const parts = address.split(' ');
      return {
        village: parts[0] || '',
        commune: parts[1] || ''
      };
    };
    
    const { village, commune } = getVillageAndCommune(elderly.address);
    
    // Tạo document mới
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1000,
                right: 1000,
                bottom: 1000,
                left: 1000,
              },
            },
          },
          children: [
            // Bảng chính chứa ảnh và thông tin
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
              rows: [
                new TableRow({
                  children: [
                    // Cột 1: Ảnh
                    new TableCell({
                      width: {
                        size: 30,
                        type: WidthType.PERCENTAGE,
                      },
                      children: [
                        ...(imageData ? [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new ImageRun({
                                data: imageData,
                                transformation: {
                                  width: 200,
                                  height: 250,
                                },
                              }),
                            ],
                          }),
                        ] : [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: "Ảnh 5x7",
                                bold: true,
                                size: 28,
                              }),
                            ],
                            spacing: { before: 100, after: 100 },
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            borders: {
                              top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
                              bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
                              left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
                              right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
                            },
                            children: [
                              new TextRun({
                                text: "",
                                size: 24,
                              }),
                            ],
                            spacing: { before: 0, after: 0 },
                          }),
                        ]),
                      ],
                    }),
                    // Cột 2: Thông tin cơ bản
                    new TableCell({
                      width: {
                        size: 70,
                        type: WidthType.PERCENTAGE,
                      },
                      children: [
                        // Phần I: Thông tin cơ bản của công dân
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "I. Thông tin cơ bản của công dân",
                              bold: true,
                              size: 28,
                            }),
                          ],
                          spacing: { after: 200 },
                        }),
                        
                        // Họ và tên
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Họ và tên: ",
                              bold: true,
                              size: 24,
                            }),
                            new TextRun({
                              text: elderly.name || "",
                              size: 24,
                            }),
                          ],
                          spacing: { after: 120 },
                        }),
                        
                        // Ngày tháng năm sinh
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Ngày tháng năm sinh: ",
                              bold: true,
                              size: 24,
                            }),
                            new TextRun({
                              text: formatDate(elderly.birthDate),
                              size: 24,
                            }),
                          ],
                          spacing: { after: 120 },
                        }),
                        
                        // Giới tính
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Giới tính: ",
                              bold: true,
                              size: 24,
                            }),
                            new TextRun({
                              text: elderly.gender || "Nữ", // Sử dụng giới tính từ dữ liệu nếu có
                              size: 24,
                            }),
                          ],
                          spacing: { after: 120 },
                        }),
                        
                        // Nơi đăng ký khai sinh
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Nơi đăng ký khai sinh: ",
                              bold: true,
                              size: 24,
                            }),
                            new TextRun({
                              text: elderly.address || "",
                              size: 24,
                            }),
                          ],
                          spacing: { after: 120 },
                        }),
                        
                        // Nơi đăng ký thường trú
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Nơi đăng ký thường trú: ",
                              bold: true,
                              size: 24,
                            }),
                            new TextRun({
                              text: elderly.address || "",
                              size: 24,
                            }),
                          ],
                          spacing: { after: 120 },
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            
            // Thông tin bổ sung (ngoài bảng)
            new Paragraph({
              children: [
                new TextRun({
                  text: "Tham gia hội NCT: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "                                                ",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
            }),
            
            // Số thẻ
            new Paragraph({
              children: [
                new TextRun({
                  text: "Số thẻ: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "                                                ",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
            }),
            
            // Ngày cấp
            new Paragraph({
              children: [
                new TextRun({
                  text: "Ngày cấp: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "                                                ",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
            }),
            
            // Số điện thoại
            new Paragraph({
              children: [
                new TextRun({
                  text: "Số điện thoại: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "                                                ",
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),
            
            // Phần II: Thông tin thuộc Hội Người cao tuổi
            new Paragraph({
              children: [
                new TextRun({
                  text: "II. Thông tin thuộc Hội Người cao tuổi",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { after: 200 },
            }),
            
            // 1. Chức danh trong Hội
            new Paragraph({
              children: [
                new TextRun({
                  text: "1  ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "Chức danh trong Hội Người cao tuổi: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "                                                ",
                  size: 24,
                }),
                new TextRun({
                  text: "",
                  size: 24,
                }),
              ],
              indent: { left: 360 },
              spacing: { before: 120, after: 200 },
            }),
            
            // 2. Về bảo vệ Người cao tuổi
            new Paragraph({
              children: [
                new TextRun({
                  text: "2  ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "Về bảo vệ Người cao tuổi:",
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 360 },
            }),
            
            // Checkbox 1
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Được bảo vệ quyền và lợi ích hợp pháp dành cho người cao tuổi",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 },
            }),
            
            // Checkbox 2
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Được chúc thọ, mừng thọ theo độ tuổi quy định và hưởng trợ cấp xã hội",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 },
            }),
            
            // Phần tiếp theo của checkbox 2
            new Paragraph({
              children: [
                new TextRun({
                  text: "chính sách người có công hàng tháng theo quy định của nhà nước",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 + 360 },
            }),
            
            // Checkbox 3
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Được khám sức khỏe định kỳ hàng tháng",
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
              indent: { left: 720 },
            }),
            
            // 3. Văn hóa thể dục thể thao
            new Paragraph({
              children: [
                new TextRun({
                  text: "3  ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "Văn hóa thể dục thể thao:",
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 360 },
            }),
            
            // Checkbox 1
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Được tham gia các câu lạc bộ, thể dục, thể thao, văn hóa, văn nghệ hoạt",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 },
            }),
            
            // Phần tiếp theo của checkbox 1
            new Paragraph({
              children: [
                new TextRun({
                  text: "động tại các thôn.",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 + 360 },
            }),
            
            // Checkbox 2
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Được tặng quà và tiễn mặt, thăng hành động vì Người cao tuổi ngày 1 tháng",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 },
            }),
            
            // Phần tiếp theo của checkbox 2
            new Paragraph({
              children: [
                new TextRun({
                  text: "10 hàng năm.",
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
              indent: { left: 720 + 360 },
            }),
            
            // 4. Về phát huy vai trò Người cao tuổi
            new Paragraph({
              children: [
                new TextRun({
                  text: "4  ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "Về phát huy vai trò Người cao tuổi",
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 360 },
            }),
            
            // Checkbox 1
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Tham gia công tác xã hội của đảng, chính quyền tại địa phương",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 },
            }),
            
            // Checkbox 2
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Người cao tuổi làm kinh tế",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 },
            }),
            
            // Checkbox 3
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Tham gia bảo vệ môi trường và xây dựng nông thôn mới",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 },
            }),
            
            // Checkbox 4
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Được tuyên truyền, tập huấn các chính sách mới của nhà nước",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 },
            }),
            
            // Checkbox 5
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Ứng hộ tiền hoặc đóng góp cho những công tác xã hội tại địa phương.",
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
              indent: { left: 720 },
            }),
            
            // 5. Người cao tuổi tham gia phòng chống tội phạm
            new Paragraph({
              children: [
                new TextRun({
                  text: "5  ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "Người cao tuổi tham gia phòng chống tội phạm, trật tự an ninh, vì an ninh tổ quốc:",
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 360 },
            }),
            
            // Checkbox 1
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Tham gia duy trì hoạt động an ninh thôn, xóm.",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 },
            }),
            
            // Checkbox 2
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Tham gia hệ thống chính trị cấp cơ sở.",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 },
            }),
            
            // Checkbox 3
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Tham gia tổ hòa giải tại thôn, xóm.",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 },
            }),
            
            // Checkbox 4
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Tham gia công tác bảo vệ biên giới biển đảo và các tệ nạn xã hội.",
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
              indent: { left: 720 },
            }),
            
            // 6. Câu lạc bộ liên thế hệ tự giúp nhau
            new Paragraph({
              children: [
                new TextRun({
                  text: "6  ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "Câu lạc bộ liên thế hệ tự giúp nhau:",
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 360 },
            }),
            
            // Checkbox 1
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Là thành viên câu lạc bộ liên thế hệ tự giúp nhau",
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 720 },
            }),
            
            // Checkbox 2
            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ ",
                  size: 24,
                }),
                new TextRun({
                  text: "Được tập huấn thường xuyên tại các câu lạc bộ liên thế hệ tự giúp nhau",
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
              indent: { left: 720 },
            }),
            
            // Phần chữ ký
            // Phần ngày tháng năm
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "                         , ngày        tháng        năm       ",
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
              indent: { right: 1000 },
            }),
            
            // Bảng chữ ký
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
              rows: [
                // Dòng chữ ký
                new TableRow({
                  children: [
                    // Cột bên trái - Lãnh đạo Hội
                    new TableCell({
                      width: {
                        size: 50,
                        type: WidthType.PERCENTAGE,
                      },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "Lãnh đạo Hội Người cao tuổi cấp xã",
                              bold: true,
                              size: 24,
                            }),
                          ],
                          spacing: { after: 200 },
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "(Xác nhận)",
                              italics: true,
                              size: 24,
                            }),
                          ],
                          spacing: { after: 800 },
                        }),
                      ],
                    }),
                    // Cột bên phải - Người cung cấp thông tin
                    new TableCell({
                      width: {
                        size: 50,
                        type: WidthType.PERCENTAGE,
                      },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "Người cung cấp thông tin",
                              bold: true,
                              size: 24,
                            }),
                          ],
                          spacing: { after: 200 },
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "(Ký ghi rõ họ tên)",
                              italics: true,
                              size: 24,
                            }),
                          ],
                          spacing: { after: 800 },
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    // Tạo và tải xuống file
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `Phieu_thong_tin_${elderlyName.replace(/\s+/g, "_") || 'Nguoi_cao_tuoi'}.docx`);
    });

    return true;
  } catch (error) {
    console.error("Lỗi khi tạo file Word:", error);
    alert("Có lỗi khi tạo file Word: " + error.message);
    return false;
  }
};

export default generateElderlyWordDocument; 