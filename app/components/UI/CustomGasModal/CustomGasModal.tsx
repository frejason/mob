import React, { useCallback, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import { useSelector } from 'react-redux';

import { selectChainId } from '../../../selectors/networkController';
import { useAppThemeFromContext } from '../../../util/theme';
import EditGasFee1559 from '../../UI/EditGasFee1559Update';
import EditGasFeeLegacy from '../../UI/EditGasFeeLegacyUpdate';
import createStyles from './CustomGasModal.styles';
import { CustomGasModalProps } from './CustomGasModal.types';

const CustomGasModal = ({
  gasSelected,
  animateOnChange,
  isAnimating,
  onlyGas,
  validateAmount,
  updateParentState,
  legacy,
  legacyGasData,
  EIP1559GasData,
  EIP1559GasTxn,
}: CustomGasModalProps) => {
  const { colors } = useAppThemeFromContext();
  const styles = createStyles();
  const transaction = useSelector((state: any) => state.transaction);
  const gasFeeEstimate = useSelector(
    (state: any) =>
      state.engine.backgroundState.GasFeeController.gasFeeEstimates,
  );
  const primaryCurrency = useSelector(
    (state: any) => state.settings.primaryCurrency,
  );
  const chainId = useSelector((state: any) => selectChainId(state));
  const selectedAsset = useSelector(
    (state: any) => state.transaction.selectedAsset,
  );
  const gasEstimateType = useSelector(
    (state: any) =>
      state.engine.backgroundState.GasFeeController.gasEstimateType,
  );

  const [selectedGas, setSelectedGas] = useState(gasSelected);
  const [eip1559Txn, setEIP1559Txn] = useState(EIP1559GasTxn);
  const [legacyGasObj, setLegacyGasObj] = useState(legacyGasData);
  const [eip1559GasObj, setEIP1559GasObj] = useState(EIP1559GasData);

  const getGasAnalyticsParams = () => ({
    active_currency: { value: selectedAsset.symbol, anonymous: true },
    gas_estimate_type: gasEstimateType,
  });

  const onChangeGas = (gas: string) => {
    setSelectedGas(gas);
    updateParentState({ gasSelected: gas });
  };

  const onCancelGas = () => {
    updateParentState({
      stopUpdateGas: false,
      gasSelectedTemp: selectedGas,
      closeModal: true,
    });
  };

  const onSaveLegacyGasOption = useCallback(
    () =>
      (
        gasTxn: { error: any; totalMaxHex: string; totalHex: string },
        gasObj: any,
        gasSelect: string,
      ) => {
        const updatedTransactionFrom = {
          ...transaction,
          from: transaction?.transaction?.from,
        };
        gasTxn.error = validateAmount({
          transaction: updatedTransactionFrom,
          total: gasTxn.totalHex,
        });
        setLegacyGasObj(gasObj);
        updateParentState({
          legacyGasTransaction: gasTxn,
          legacyGasObject: gasObj,
          gasSelected: gasSelect,
          closeModal: true,
          stopUpdateGas: false,
          advancedGasInserted: !gasSelect,
          gasSelectedTemp: gasSelect,
        });
      },
    [transaction, validateAmount, updateParentState],
  );

  const onSaveEIP1559GasOption = useCallback(
    () =>
      (
        gasTxn: { error: any; totalMaxHex: string; totalHex: string },
        gasObj: any,
      ) => {
        const updatedTransactionFrom = {
          ...transaction,
          from: transaction?.transaction?.from,
        };
        gasTxn.error = validateAmount({
          transaction: updatedTransactionFrom,
          total: gasTxn.totalMaxHex,
        });

        setEIP1559Txn(gasTxn);
        setEIP1559GasObj(gasObj);
        updateParentState({
          EIP1559GasTransaction: gasTxn,
          EIP1559GasObject: gasObj,
          gasSelectedTemp: selectedGas,
          gasSelected: selectedGas,
          closeModal: true,
        });
      },
    [transaction, validateAmount, updateParentState, selectedGas],
  );

  const legacyGasObject = {
    legacyGasLimit: legacyGasObj?.legacyGasLimit,
    suggestedGasPrice: legacyGasObj?.suggestedGasPrice,
  };

  const eip1559GasObject = {
    suggestedMaxFeePerGas:
      eip1559GasObj?.suggestedMaxFeePerGas ||
      eip1559GasObj?.[selectedGas]?.suggestedMaxFeePerGas,
    suggestedMaxPriorityFeePerGas:
      eip1559GasObj?.suggestedMaxPriorityFeePerGas ||
      gasFeeEstimate[selectedGas]?.suggestedMaxPriorityFeePerGas,
    suggestedGasLimit:
      eip1559GasObj?.suggestedGasLimit || eip1559Txn?.suggestedGasLimit,
  };

  return (
    <Modal
      isVisible
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={styles.bottomModal}
      backdropColor={colors.overlay.default}
      backdropOpacity={1}
      animationInTiming={600}
      animationOutTiming={600}
      onBackdropPress={onCancelGas}
      onBackButtonPress={onCancelGas}
      onSwipeComplete={onCancelGas}
      swipeDirection={'down'}
      propagateSwipe
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.keyboardAwareWrapper}
      >
        {legacy ? (
          <EditGasFeeLegacy
            selected={selectedGas}
            gasEstimateType={gasEstimateType}
            gasOptions={gasFeeEstimate}
            onChange={onChangeGas}
            primaryCurrency={primaryCurrency}
            chainId={chainId}
            onCancel={onCancelGas}
            onSave={onSaveLegacyGasOption}
            animateOnChange={animateOnChange}
            isAnimating={isAnimating}
            analyticsParams={getGasAnalyticsParams()}
            view={'SendTo (Confirm)'}
            onlyGas={false}
            selectedGasObject={legacyGasObject}
          />
        ) : (
          <EditGasFee1559
            selectedGasValue={selectedGas}
            gasOptions={gasFeeEstimate}
            onChange={onChangeGas}
            primaryCurrency={primaryCurrency}
            chainId={chainId}
            onCancel={onCancelGas}
            onSave={onSaveEIP1559GasOption}
            animateOnChange={animateOnChange}
            isAnimating={isAnimating}
            analyticsParams={getGasAnalyticsParams()}
            view={'SendTo (Confirm)'}
            selectedGasObject={eip1559GasObject}
            onlyGas={onlyGas}
          />
        )}
      </KeyboardAwareScrollView>
    </Modal>
  );
};

export default CustomGasModal;
