import { RNN } from "..";

describe('Deep Recurrent Neural Network (RNN):', () => {

  let sut: RNN;

  describe('Instantiation:', () => {

    describe('Configuration with NetOpts:', () => {

      const config = {
        inputSize: 2, hiddenUnits: [3, 4], outputSize: 3
      };

      beforeEach(() => {
        sut = new RNN(config);
      });

      it('fresh instance >> on creation >> should hold model with hidden layer, containing arrays of weight and bias matrices', () => {
        expect(sut.model).toBeDefined();
        expect(sut.model.hidden).toBeDefined();
        expect(sut.model.hidden.Wh).toBeDefined();
        expect(sut.model.hidden.Wh.length).toBe(2);
        expect(sut.model.hidden.Wx).toBeDefined();
        expect(sut.model.hidden.Wx.length).toBe(2);
        expect(sut.model.hidden.bh).toBeDefined();
        expect(sut.model.hidden.bh.length).toBe(2);
      });

      it('fresh instance >> on creation >> should hold model with decoder layer, containing weight and bias matrices', () => {
        expect(sut.model.decoder).toBeDefined();
        expect(sut.model.decoder.Wh).toBeDefined();
        expect(sut.model.decoder.b).toBeDefined();
      });

      describe('Hidden Layer:', () => {

        it('fresh instance >> on creation >> model should hold hidden layer containing weight matrices with expected dimensions', () => {
          expectHiddenWeightMatricesToHaveColsOfSizeOfPreviousLayerAndRowsOfConfiguredLength(2, [3, 4]);
        });

        it('fresh instance >> on creation >> model should hold hidden layer containing bias matrices with expected dimensions', () => {
          expectHiddenBiasMatricesToHaveRowsOfSizeOfPreviousLayerAndColsOfSize1(2, [3, 4]);
        });

        const expectHiddenWeightMatricesToHaveColsOfSizeOfPreviousLayerAndRowsOfConfiguredLength = (inputSize: number, hiddenUnits: Array<number>) => {
          let previousLayerSize = inputSize;
          let expectedRows, expectedCols;
          for (let i = 0; i < config.hiddenUnits.length; i++) {
            expectedRows = hiddenUnits[i];
            expectedCols = previousLayerSize;
            expect(sut.model.hidden.Wx[i].rows).toBe(expectedRows);
            expect(sut.model.hidden.Wx[i].cols).toBe(expectedCols);
            previousLayerSize = expectedRows;
          }
        };

        const expectHiddenBiasMatricesToHaveRowsOfSizeOfPreviousLayerAndColsOfSize1 = (inputSize: number, hiddenUnits: Array<number>) => {
          let previousLayerSize = inputSize;
          let expectedRows;
          let expectedCols = 1;
          for (let i = 0; i < config.hiddenUnits.length; i++) {
            expectedRows = hiddenUnits[i];
            expect(sut.model.hidden.bh[i].rows).toBe(expectedRows);
            expect(sut.model.hidden.bh[i].cols).toBe(expectedCols);
            previousLayerSize = expectedRows;
          }
        };
      });
    });
  });

  describe('Backpropagation:', () => {

    const config = { inputSize: 2, hiddenUnits: [3, 4], outputSize: 3 };

    beforeEach(() => {
      sut = new RNN(config);

      spyOnUpdateMethods();
    });

    describe('Update:', () => {
  
      describe('Hidden Layer:', () => {
      
        it('fresh instance >> update >> should call update methods of weight and bias matrices of all hidden layer', () => {
          sut.update(0.01);
  
          expectUpdateOfLayersMethodsToHaveBeenCalled();
        });
  
        it('fresh instance >> update >> should call update methods of weight and bias matrices of all hidden layer with given value', () => {
          sut.update(0.01);
  
          expectUpdateOfLayersMethodsToHaveBeenCalledWithValue(0.01);
        });
  
        const expectUpdateOfLayersMethodsToHaveBeenCalled = () => {
          for (let i = 0; i < config.hiddenUnits.length; i++) {
            expect(sut.model.hidden.Wx[i].update).toHaveBeenCalled();
            expect(sut.model.hidden.Wh[i].update).toHaveBeenCalled();
            expect(sut.model.hidden.bh[i].update).toHaveBeenCalled();
          }
        };
        
        const expectUpdateOfLayersMethodsToHaveBeenCalledWithValue = (value: number) => {
          for (let i = 0; i < config.hiddenUnits.length; i++) {
            expect(sut.model.hidden.Wx[i].update).toHaveBeenCalledWith(value);
            expect(sut.model.hidden.Wh[i].update).toHaveBeenCalledWith(value);
            expect(sut.model.hidden.bh[i].update).toHaveBeenCalledWith(value);
          }
        };
      });
  
      describe('Decoder Layer:', () => {
      
        it('fresh instance >> update >> should call update methods of weight and bias matrices of decoder layer', () => {
          sut.update(0.01);
          
          expectUpdateOfLayersMethodsToHaveBeenCalled();
        });
        
        it('fresh instance >> update >> should call update methods of weight and bias matrices of decoder layer with given value', () => {
          sut.update(0.01);
          
          expectUpdateOfLayersMethodsToHaveBeenCalledWithValue(0.01);
        });
  
        const expectUpdateOfLayersMethodsToHaveBeenCalled = () => {
          expect(sut.model.decoder.Wh.update).toHaveBeenCalled();
          expect(sut.model.decoder.b.update).toHaveBeenCalled();
        };
  
        const expectUpdateOfLayersMethodsToHaveBeenCalledWithValue = (value: number) => {
          expect(sut.model.decoder.Wh.update).toHaveBeenCalledWith(value);
          expect(sut.model.decoder.b.update).toHaveBeenCalledWith(value);
        };
      });
    });
  
    const spyOnUpdateMethods = () => {
      for (let i = 0; i < config.hiddenUnits.length; i++) {
        spyOn(sut.model.hidden.Wx[i], 'update');
        spyOn(sut.model.hidden.Wh[i], 'update');
        spyOn(sut.model.hidden.bh[i], 'update');
      }
  
      spyOn(sut.model.decoder.Wh, 'update');
      spyOn(sut.model.decoder.b, 'update');
    };
  });
});