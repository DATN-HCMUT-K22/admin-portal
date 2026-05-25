# API Document: User Creation (Tạo User)

Tài liệu này mô tả chi tiết các API dùng để tạo user mới trong hệ thống, phục vụ cho Frontend (FE) tích hợp, đặc biệt là trên trang Admin Dashboard.

---

## 1. API: Create User (Dành cho Admin tạo User kèm Roles)

API này cho phép System Admin tạo một người dùng mới và gán trực tiếp các vai trò (roles) cho người dùng đó.

- **Endpoint:** `POST /api/v1/users/with-roles`
- **Method:** `POST`
- **Authentication:** Cần có token (Role: `SYSTEM_ADMIN`)

### 1.1. Request Body

Dữ liệu gửi lên server định dạng `application/json`.

| Field | Type | Required | Constraints / Description |
| :--- | :--- | :---: | :--- |
| `username` | String | Yes | Tên đăng nhập. Unique, tối thiểu 4 ký tự. |
| `email` | String | Yes | Địa chỉ email của người dùng. Unique, định dạng email hợp lệ. |
| `password` | String | Yes | Mật khẩu. Tối thiểu 8 ký tự. |
| `fullName` | String | No | Họ và tên của người dùng. |
| `roles` | String[] | Yes | Mảng chứa tên các role muốn gán cho user (VD: `["USER", "BUSINESS_ADMIN"]`). Không được để trống. |

**Example Request:**
```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "StrongPassword123!",
  "fullName": "John Doe",
  "roles": ["USER", "BUSINESS_ADMIN"]
}
```

### 1.2. Response

Thành công trả về `HTTP Status 200 OK`. Dữ liệu trả về được bọc trong object `ApiResponse`.

| Field | Type | Description |
| :--- | :--- | :--- |
| `code` | Integer | Mã code kết quả (VD: 1000 cho Success). |
| `message` | String | Thông báo kết quả. |
| `data` | Object | Chứa thông tin chi tiết của user vừa được tạo. |

**Cấu trúc đối tượng `data` (UserResponse):**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | ID duy nhất của user. |
| `username` | String | Tên đăng nhập. |
| `email` | String | Địa chỉ email. |
| `dateOfBirth` | String | Ngày sinh (YYYY-MM-DD). Có thể null. |
| `isEmailVerified` | Boolean | Trạng thái xác thực email. |
| `phoneNumber` | String | Số điện thoại. Có thể null. |
| `fullName` | String | Họ và tên. |
| `bio` | String | Tiểu sử. Có thể null. |
| `avatarUrl` | String | Đường dẫn tới ảnh đại diện. Có thể null. |
| `credits` | Long | Số điểm/credits của user. |
| `isDeleted` | Boolean | Cờ đánh dấu user bị xóa mềm. |
| `isLocked` | Boolean | Trạng thái khóa tài khoản. |
| `roles` | Array | Mảng chứa các object role (bao gồm `name`, `description`, `permissions`). |

**Example Response:**
```json
{
  "code": 1000,
  "message": "Success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "dateOfBirth": null,
    "isEmailVerified": false,
    "phoneNumber": null,
    "fullName": "John Doe",
    "bio": null,
    "avatarUrl": null,
    "credits": 0,
    "isDeleted": false,
    "isLocked": false,
    "roles": [
      {
        "name": "USER",
        "description": "Default user role",
        "permissions": []
      },
      {
        "name": "BUSINESS_ADMIN",
        "description": "Business administrator",
        "permissions": []
      }
    ]
  }
}
```

---

## 2. API: Create Normal User (Không kèm Roles)

API này cho phép tạo một người dùng cơ bản (thường được gán mặc định role `USER` ở backend). 

- **Endpoint:** `POST /api/v1/users`
- **Method:** `POST`

### 2.1. Request Body

Dữ liệu gửi lên server định dạng `application/json`.

| Field | Type | Required | Constraints / Description |
| :--- | :--- | :---: | :--- |
| `username` | String | Yes | Tên đăng nhập. Unique, tối thiểu 4 ký tự. |
| `email` | String | Yes | Địa chỉ email của người dùng. Unique. |
| `password` | String | Yes | Mật khẩu. Tối thiểu 8 ký tự. |
| `fullName` | String | No | Họ và tên của người dùng. |

**Example Request:**
```json
{
  "username": "janedoe",
  "email": "janedoe@example.com",
  "password": "StrongPassword123!",
  "fullName": "Jane Doe"
}
```

### 2.2. Response

Cấu trúc response tương tự như API `POST /api/v1/users/with-roles`, trả về `UserResponse` nằm trong đối tượng `data`.

---

## 3. Lưu ý cho FE khi Integrate

1. **Gửi Token**: Đối với API `/api/v1/users/with-roles`, FE cần đính kèm Bearer token của tài khoản admin vào header `Authorization` khi gọi API (trường hợp sử dụng interceptor thì đã tự động gắn).
2. **Xử lý Validation Error**: Nếu dữ liệu đầu vào không hợp lệ (ví dụ: mật khẩu ngắn hơn 8 ký tự, email sai định dạng, username đã tồn tại), Backend sẽ trả về `HTTP Status 400 Bad Request` cùng với thông báo lỗi tương ứng. FE cần bắt lỗi này để hiển thị message phù hợp trên UI.
3. **Danh sách Roles**: Ở API tạo user kèm role, FE sẽ lấy danh sách các role hợp lệ từ API lấy danh sách roles (`GET /api/v1/roles`) trước, sau đó cho người dùng chọn và gửi danh sách các `name` của role vào mảng `roles`.
