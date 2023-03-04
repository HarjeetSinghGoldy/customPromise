class MyPromise {
    constructor(executor) {
      this.executor = executor;
      this.state = 'pending';
      this.result = null;
      this.error = null;
      this.callbacks = [];
      
      const resolve = (result) => {
        if (this.state === 'pending') {
          this.state = 'fulfilled';
          this.result = result;
          this.callbacks.forEach(callback => callback.onFulfilled(this.result));
        }
      };
      
      const reject = (error) => {
        if (this.state === 'pending') {
          this.state = 'rejected';
          this.error = error;
          this.callbacks.forEach(callback => callback.onRejected(this.error));
        }
      };
      
      try {
        executor(resolve, reject);
      } catch (error) {
        reject(error);
      }
    }
    
    then(onFulfilled, onRejected) {
      return new MyPromise((resolve, reject) => {
        if (this.state === 'fulfilled') {
          try {
            const result = onFulfilled(this.result);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else if (this.state === 'rejected') {
          try {
            const result = onRejected(this.error);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else {
          this.callbacks.push({
            onFulfilled: (result) => {
              try {
                const newResult = onFulfilled(result);
                resolve(newResult);
              } catch (error) {
                reject(error);
              }
            },
            onRejected: (error) => {
              try {
                const newResult = onRejected(error);
                resolve(newResult);
              } catch (error) {
                reject(error);
              }
            }
          });
        }
      });
    }
    
    catch(onRejected) {
      return this.then(null, onRejected);
    }
  }
  