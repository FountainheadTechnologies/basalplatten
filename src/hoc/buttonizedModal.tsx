import React from 'react';
import Button from 'antd/lib/button';
import { ButtonProps as AntButtonProps } from 'antd/lib/button/button';
import 'antd/lib/button/style';
import Modal from 'antd/lib/modal';
import { ModalProps as AntModalProps } from 'antd/lib/modal/Modal';
import 'antd/lib/modal/style';

export interface ButtonProps extends AntButtonProps {
  label: string;
}

export interface ModalProps extends AntModalProps {
  closeButton: boolean;
}

export interface Props {
  button?: Partial<ButtonProps>;
  modal?: Partial<ModalProps>;
}

export interface InjectedProps {
  setVisible: (visible: boolean) => void;
  setWorking: (working: boolean) => void;
  setFooter: (footer: React.ReactNode) => void;
  setOkHandler: (okHandler: (() => void)) => void;
}

export interface State {
  modal: {
    visible: boolean;
    working: boolean;
    okHandler?: () => void;
    footer?: React.ReactNode;
  };
  mappedProps: Props;
}

export const buttonizedModal =
  <P extends any>(
    ModalContent: React.ComponentType<P>,
    propMapper: ((props: P) => Props) | Props
  ): React.ComponentClass<P> =>
    class ButtonizedModal extends React.Component<P & Props & InjectedProps, State> {
      state: State = {
        modal: {
          visible: false,
          working: false
        },

        mappedProps: typeof propMapper === 'function' ?
          propMapper(this.props as any) :
          propMapper
      };

      render() {
        const buttonProps = this.buttonProps();

        return (
          <Button {...buttonProps}>
            {buttonProps.label}
            {this.renderModal()}
          </Button>
        );
      }

      buttonProps(): ButtonProps {
        const { mappedProps } = this.state;

        return {
          ...mappedProps.button,
          ...this.props.button as ButtonProps,
          onClick: () => this.setVisible(true)
        }
      }

      renderModal() {
        const { modal } = this.state;

        if (!modal.visible) {
          return null;
        }

        const modalProps = this.modalProps();
        const modalContentProps = this.modalContentProps();

        return (
          <Modal {...modalProps}>
            <ModalContent {...modalContentProps} />
          </Modal>
        );
      }

      modalProps(): Props['modal'] {
        const { modal, mappedProps } = this.state;

        const modalProps: ModalProps = {
          ...mappedProps.modal,
          ...this.props.modal as ModalProps,
          ...modal,

          confirmLoading: modal.working,
          closable: !modal.working,
          onCancel: () => this.setVisible(false),
          onOk: () => this.onOk()
        }

        if (!('maskClosable' in modalProps)) {
          modalProps.maskClosable = !this.state.modal.working;
        }

        if (!modalProps.footer && mappedProps.modal && mappedProps.modal.closeButton) {
          modalProps.footer = (
            <Button size="large" onClick={() => this.setVisible(false)}>
              Close
            </Button>
          );
        }

        return modalProps;
      }

      modalContentProps(): Props & InjectedProps {
        const { mappedProps } = this.state;

        return {
          ...this.props as Props,
          ...mappedProps,
          setVisible: this.setVisible,
          setWorking: this.setWorking,
          setFooter: this.setFooter,
          setOkHandler: this.setOkHandler
        }
      }

      setVisible = (visible: boolean) => {
        const { modal } = this.state;

        this.setState({
          modal: {
            ...modal,
            working: visible ? modal.working : false,
            visible
          }
        });
      }

      setWorking = (working: boolean) => {
        const { modal } = this.state;

        this.setState({
          modal: {
            ...modal,
            working
          }
        });
      }

      setFooter = (footer: React.ReactNode) => {
        const { modal } = this.state;

        this.setState({
          modal: {
            ...modal,
            footer
          }
        });
      }

      setOkHandler = (okHandler: () => void) => {
        const { modal } = this.state;

        this.setState({
          modal: {
            ...modal,
            okHandler
          }
        });
      }

      onOk = () => {
        const { modal } = this.state;

        if (modal.okHandler) {
          return modal.okHandler();
        }

        this.setVisible(false);
      }
    }
