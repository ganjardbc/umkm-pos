// Mock API for authentication

export const postLogin = async (data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          data: {
            token:  'fake-jwt-token',
            username: data.username,
            email: data.username + '@example.com',
            nip: '123456789',
            namaBagian: 'IT Department',
            namaPegawai: 'John Doe',
            bagianId: '1',
            pegawaiId: '1001',
            rolePermissions: {
              role: 'admin',
              roleName: 'Administrator',
              features: [
                {
                  name: 'Dashboard',
                  permissions: ['dashboard:view'],
                },
                {
                  name: 'Reports',
                  permissions: ['reports:view'],
                },
              ],
              permissions: ['dashboard:view', 'reports:view'],
            },
          },
          status: 200,
        }
      });
    }, 1000);
  });
};
