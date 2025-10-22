-- 1. Danh sách sinh viên khoa CNTT Khóa 2002-2006
SELECT SINHVIEN.* FROM SinhVien
JOIN Lop ON SinhVien.ma_lop = Lop.ma_lop
JOIN KhoaHoc ON KhoaHoc.ma_khoa_hoc = Lop.ma_khoa_hoc
JOIN Khoa ON Khoa.ma_khoa = Lop.ma_khoa
WHERE Khoa.ma_khoa = 'CNTT' 
AND KhoaHoc.ma_khoa_hoc = 'K2002';

-- 2. Cho biết các sinh viên (Mã sinh viên, Họ tên, Năm sinh)
-- của các sinh viên học sớm hơn tuổi quy định
-- (Theo tuổi quy định thì sinh viên đủ 18 tuổi khi bắt đầu khóa học)
SELECT sv.ma_sv, sv.ho_ten, sv.nam_sinh FROM SinhVien sv
JOIN Lop l ON l.ma_lop = sv.ma_lop
JOIN KhoaHoc kh ON kh.ma_khoa_hoc = l.ma_khoa_hoc
WHERE kh.nam_bat_dau - sv.nam_sinh < 18;

