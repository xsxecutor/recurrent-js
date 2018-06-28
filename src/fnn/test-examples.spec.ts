import { Utils, DNN, BNN } from '..';
import { ANN } from './ann';
import { TrainingSet } from './utils/training-set';

describe('Examples with Neural Networks:', () => {
  /**
   * All testparameters are configured to surpass a test-series of 10.000 Iterations without failing it.
   */

  let sut: ANN;
  let trainingSet: TrainingSet;

  beforeEach(() => {
    trainingSet = new TrainingSet();
  });

  fdescribe('Stateless Network Architectures:', () => {

    beforeEach(() => {
      trainingSet.setSamples([
        { input: [0, 1], output: [0, 1, 0] },
        { input: [1, 0], output: [1, 0, 1] }
      ]);
    });

    describe('Deep Feedforward Neural Network (DNN):', () => {

      const config = {
        architecture: { inputSize: 2, hiddenUnits: [2, 3], outputSize: 3 },
        training: { loss: 1e-11 }
      };

      it('given fresh instance >> perform iterative training routine >> should output exact expected results after 12.000 iterations', () => {
        // for(let j = 0; j < 10000; j++) {
        const trainingIterations = 12000;

        sut = new DNN(config);

        // Output container
        const actualOutputsForSample = [];

        // Get Output of the untrained network
        for (let i = 0; i < trainingSet.length(); i++) {
          actualOutputsForSample[i] = sut.forward(trainingSet.getInputForSample(i));
        }

        // Expect untrained output not to be matching the expected results (even with a low precision)
        expectOutputOfUntrainedNetworkToNotBeCloseToExpectedOutputs(actualOutputsForSample);

        // Prepare for Training
        sut.setTrainability(true);

        // keep track of the squared prediction loss
        const losses = [];
        const performTrainingRoutineForSample = (i: number): number => {
          sut.forward(trainingSet.getInputForSample(i));
          const actualLoss = sut.backward(trainingSet.getExpectedOutputForSample(i));
          return actualLoss;
        };

        // Start Training (with Stochastic Gradient)
        for (let i = 0; i < trainingIterations; i++) {
          const ix = getRandomIndex();
          // perform training routine for sample and gather squared loss
          losses[i] = performTrainingRoutineForSample(ix);
        }

        // Get Output of the trained network
        for (let i = 0; i < trainingSet.length(); i++) {
          actualOutputsForSample[i] = sut.forward(trainingSet.getInputForSample(i));
        }

        // Expect trained output to be close to the expected results (with a high precision of 1e-11 resp. 10)
        expectOutputOfTrainedNetworkToBeCloseToExpectedOutputs(actualOutputsForSample, 10);
        // Expect squared error to be near 0
        expect(losses[trainingIterations - 1]).toBeCloseTo(0);
        // }
      });

      it('given fresh instance >> perform iterative training routine with varying alpha >> should output exact expected results after 3.000 iterations', () => {
        // for (let j = 0; j < 10000; j++) {
        const trainingIterations = 3000;
        const alphaMin = 0.001;
        const alphaMax = 0.9;

        sut = new DNN(config);

        // Output container
        const actualOutputsForSample = [];

        // Get Output of the untrained network
        for (let i = 0; i < trainingSet.length(); i++) {
          actualOutputsForSample[i] = sut.forward(trainingSet.getInputForSample(i));
        }

        // Expect untrained output not to be matching the expected results (even with a low precision)
        expectOutputOfUntrainedNetworkToNotBeCloseToExpectedOutputs(actualOutputsForSample);

        // Prepare for Training
        sut.setTrainability(true);

        // keep track of the squared prediction loss
        const losses = [];
        const performTrainingRoutineForSample = (i: number, alpha: number): number => {
          sut.forward(trainingSet.getInputForSample(i));
          const actualLoss = sut.backward(trainingSet.getExpectedOutputForSample(i), alpha);
          return actualLoss;
        };

        // Start Training (with Stochastic Gradient)
        for (let i = 0; i < trainingIterations; i++) {
          const ix = getRandomIndex();
          // perform training routine for sample and gather squared loss
          const alpha = getRandomAlpha(alphaMin, alphaMax);
          losses[i] = performTrainingRoutineForSample(ix, alpha);
        }

        // Get Output of the trained network
        for (let i = 0; i < trainingSet.length(); i++) {
          actualOutputsForSample[i] = sut.forward(trainingSet.getInputForSample(i));
        }

        // Expect trained output to be close to the expected results (with a high precision of 1e-11 resp. 10)
        expectOutputOfTrainedNetworkToBeCloseToExpectedOutputs(actualOutputsForSample, 10);
        // Expect squared error to be near 0
        expect(losses[trainingIterations - 1]).toBeCloseTo(0);
        // }
      });
    });

    describe('Deep Bayesian Feedforward Neural Network (BNN):', () => {

      const distort = (arr: Array<number>): Array<number> => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Utils.randn(arr[i], 0.000001);
        }
        return arr;
      };

      const config = {
        architecture: { inputSize: 2, hiddenUnits: [2, 3], outputSize: 3 },
        training: { loss: 1e-11 }
      };

      it('given fresh instance >> perform iterative training routine >> should output a small squared loss after 10.000 iterations (squared error < 1)', () => {
        // for (let j = 0; j < 10000; j++) {
        const trainingIterations = 10000;

        sut = new BNN(config);
        // Output container
        const actualOutputsForSample = [];

        // Get Output of the untrained network
        for (let i = 0; i < trainingSet.length(); i++) {
          const fuzzyInput = distort(trainingSet.getInputForSample(i));
          actualOutputsForSample[i] = sut.forward(fuzzyInput);
        }

        // Expect untrained output not to be matching the expected results (even with a low precision)
        expectOutputOfUntrainedNetworkToNotBeCloseToExpectedOutputs(actualOutputsForSample);

        // Prepare for Training
        sut.setTrainability(true);

        // keep track of the squared prediction loss
        const losses = [];
        const performTrainingRoutineForSample = (i: number): number => {
          const fuzzyInput = distort(trainingSet.getInputForSample(i));
          sut.forward(fuzzyInput);
          const actualLoss = sut.backward(trainingSet.getExpectedOutputForSample(i));
          return actualLoss;
        };

        // Start Training (with Stochastic Gradient)
        for (let i = 0; i < trainingIterations; i++) {
          const ix = getRandomIndex();
          // perform training routine for sample and gather squared loss
          losses[i] = performTrainingRoutineForSample(ix);
        }

        // Get Output of the trained network
        for (let i = 0; i < trainingSet.length(); i++) {
          actualOutputsForSample[i] = sut.forward(trainingSet.getInputForSample(i));
        }

        // Expect trained output to be close to the expected results (with a high precision of 1e-11 resp. 10)
        // expectOutputOfTrainedNetworkToBeCloseToExpectedOutputs(actualOutputsForSample, 3);
        // Expect squared error to be near 0
        expect(losses[trainingIterations - 1]).toBeCloseTo(0, 0);
        // }
      });

      it('given fresh instance >> perform iterative training routine with varying alpha >> should output a good approximation of expected results after 6.000 iterations (squared error < 1)', () => {
        // for (let j = 0; j < 10000; j++) {
        const trainingIterations = 6000;
        const alphaMin = 0.001;
        const alphaMax = 0.1;

        sut = new BNN(config);

        // Output container
        const actualOutputsForSample = [];

        // Get Output of the untrained network
        for (let i = 0; i < trainingSet.length(); i++) {
          actualOutputsForSample[i] = sut.forward(trainingSet.getInputForSample(i));
        }

        // Expect untrained output not to be matching the expected results (even with a low precision)
        expectOutputOfUntrainedNetworkToNotBeCloseToExpectedOutputs(actualOutputsForSample);

        // Prepare for Training
        sut.setTrainability(true);

        // keep track of the squared prediction loss
        const losses = [];
        const performTrainingRoutineForSample = (i: number, alpha: number): number => {
          sut.forward(trainingSet.getInputForSample(i));
          const actualLoss = sut.backward(trainingSet.getExpectedOutputForSample(i), alpha);
          return actualLoss;
        };

        // Start Training (with Stochastic Gradient Descent)
        for (let i = 0; i < trainingIterations; i++) {
          const ix = getRandomIndex();
          // perform training routine for sample and gather squared loss
          const alpha = getRandomAlpha(alphaMin, alphaMax);
          losses[i] = performTrainingRoutineForSample(ix, alpha);
        }

        // Get Output of the trained network
        for (let i = 0; i < trainingSet.length(); i++) {
          actualOutputsForSample[i] = sut.forward(trainingSet.getInputForSample(i));
        }

        // Expect trained output to be close to the expected results (with a high precision of 1e-11 resp. 10)
        // expectOutputOfTrainedNetworkToBeCloseToExpectedOutputs(actualOutputsForSample, 1);
        // Expect squared error to be near 0
        expect(losses[trainingIterations - 1]).toBeCloseTo(0, 0);
        // }
      });

    });

    const expectOutputOfUntrainedNetworkToNotBeCloseToExpectedOutputs = (actualOutputs: Array<number>) => {
      for (let trainingSample = 0; trainingSample < trainingSet.length(); trainingSample++) {
        const actual = actualOutputs[trainingSample];
        const expected = trainingSet.getExpectedOutputForSample(trainingSample);
        for (let dataPoint = 0; dataPoint < expected.length; dataPoint++) {
          expect(actual[dataPoint]).not.toBeCloseTo(expected[dataPoint], '[untrained] Actual output for Sample ' + trainingSample + ' at position ' + dataPoint + ' was close to ' + expected[dataPoint]);
        }
      }
    };

    const expectOutputOfTrainedNetworkToBeCloseToExpectedOutputs = (actualOutputs: Array<number>, precision?: number): void => {
      for (let trainingSample = 0; trainingSample < trainingSet.length(); trainingSample++) {
        const actual = actualOutputs[trainingSample];
        const expected = trainingSet.getExpectedOutputForSample(trainingSample);
        for (let dataPoint = 0; dataPoint < expected.length; dataPoint++) {
          const errorMessage = '[trained] Actual output for Sample ' + trainingSample + ' at position ' + dataPoint + ' was not close to ' + expected[dataPoint];
          if (precision) { expect(actual[dataPoint]).toBeCloseTo(expected[dataPoint], precision, errorMessage); }
          else { expect(actual[dataPoint]).toBeCloseTo(expected[dataPoint], errorMessage); }
        }
      }
    };

    const getRandomIndex = (): number => {
      return Utils.randi(0, trainingSet.length());
    };

    const getRandomAlpha = (min: number, max: number): number => {
      return Utils.randf(min, max);
    };
  });
});
