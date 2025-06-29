const { verifyToken, verifyAdmin } = require('../../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if authorization header is missing', () => {
    verifyToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: 'Authorization header is missing' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is missing in authorization header', () => {
    req.headers['authorization'] = 'Bearer ';
    
    verifyToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: 'Token is missing' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    req.headers['authorization'] = 'Bearer invalid_token';
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });
    
    verifyToken(req, res, next);
    
    expect(jwt.verify).toHaveBeenCalledWith('invalid_token', process.env.JWT_SECRET, expect.any(Function));
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set user in request and call next if token is valid', () => {
    req.headers['authorization'] = 'Bearer valid_token';
    const mockUser = { id: 123, username: 'testuser', isAdmin: true };
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, mockUser);
    });
    
    verifyToken(req, res, next);
    
    expect(jwt.verify).toHaveBeenCalledWith('valid_token', process.env.JWT_SECRET, expect.any(Function));
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('should handle unexpected errors and return 500', () => {
    req.headers['authorization'] = 'Bearer valid_token';
    jwt.verify.mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    
    console.error = jest.fn();
    
    verifyToken(req, res, next);
    
    expect(console.error).toHaveBeenCalledWith(
      'Unexpected error in verifyToken middleware:',
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: 'Internal server error' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('Admin Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next if user is admin', () => {
    req.user = { id: 1, isAdmin: true };
    
    verifyAdmin(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not admin', () => {
    req.user = { id: 1, isAdmin: false };
    
    verifyAdmin(req, res, next);
    
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ message: 'Unauthorized: Admin access required' });
  });

  it('should return 403 if user object is missing', () => {
    req.user = undefined;
    
    verifyAdmin(req, res, next);
    
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ message: 'Unauthorized: Admin access required' });
  });
});