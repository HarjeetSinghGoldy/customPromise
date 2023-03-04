class MyPromise {
    constructor(executor) {
        // Initialize internal state
        this.executor = executor;
        this.state = 'pending';
        this.result = null;
        this.error = null;
        this.callbacks = [];

        // Define resolve and reject functions
        const resolve = (result) => {
            // Only update state if Promise is pending
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.result = result;

                // Execute all registered onFulfilled callbacks
                this.callbacks.forEach(callback => callback.onFulfilled(this.result));
            }
        };

        const reject = (error) => {
            // Only update state if Promise is pending
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.error = error;

                // Execute all registered onRejected callbacks
                this.callbacks.forEach(callback => callback.onRejected(this.error));
            }
        };

        try {
            // Call executor function with resolve and reject functions
            executor(resolve, reject);
        } catch (error) {
            // If executor function throws an error, reject the Promise
            reject(error);
        }
    }

    then(onFulfilled, onRejected) {
        // Return new Promise that represents result of callback function
        return new MyPromise((resolve, reject) => {
            if (this.state === 'fulfilled') {
                try {
                    // Call onFulfilled callback with resolved value
                    const result = onFulfilled(this.result);

                    // Resolve new Promise with result of onFulfilled callback
                    resolve(result);
                } catch (error) {
                    // If onFulfilled callback throws an error, reject new Promise
                    reject(error);
                }
            } else if (this.state === 'rejected') {
                try {
                    // Call onRejected callback with rejection reason
                    const result = onRejected(this.error);

                    // Resolve new Promise with result of onRejected callback
                    resolve(result);
                } catch (error) {
                    // If onRejected callback throws an error, reject new Promise
                    reject(error);
                }
            } else {
                // If Promise is still pending, register onFulfilled and onRejected callbacks
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
        // Return new Promise that represents result of onRejected callback function
        return new MyPromise((resolve, reject) => {
            if (this.state === 'rejected') {
                try {
                    // Call onRejected callback with rejection reason
                    const result = onRejected(this.error);

                    // Resolve new Promise with result of onRejected callback
                    resolve(result);
                } catch (error) {
                    // If onRejected callback throws an error, reject new Promise
                    reject(error);
                }
            } else {
                // If Promise is not rejected, register onRejected callback
                this.callbacks.push({
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
}

// Example usage
const promise = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve('Success!');
    }, 1000);
});

promise
    .then(result => {
        console.log(result); // Output: Success!
        return 'New Result';
    })
    .then(result => {
        console.log(result); // Output: New Result
        throw new Error('Something went wrong');
    })
    .catch(error => {
        console.error(error); // Output: Error: Something went wrong
    });  