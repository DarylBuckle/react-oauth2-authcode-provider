import React from 'react'
import styles from './styles.module.css'

interface ILoaderProps {
  text?: string
  styles?: any
  btnText?: string
  onBtnClick?: () => void
}

const Message = (props: ILoaderProps) => {
  return (
    <div className={styles['loader-box']} style={props.styles}>
      {props.text ? (
        <div className={styles['loader-text']}>
          {props.text}
          {props.onBtnClick ? (
            <div>
              <button
                className='btn btn-primary'
                style={{ marginTop: '15px' }}
                onClick={props.onBtnClick}
              >
                {props.btnText}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default Message
