import React from 'react'
import styles from './styles.module.css'

interface ILoaderProps {
  text?: string
  styles?: any
}

const Loader = (props: ILoaderProps) => {
  return (
    <div className={styles['loader-box']} style={props.styles}>
      <div className={styles['pulse-container']}>
        <div
          className={styles['pulse-bubble'] + ' ' + styles['pulse-bubble-1']}
        />
        <div
          className={styles['pulse-bubble'] + ' ' + styles['pulse-bubble-2']}
        />
        <div
          className={styles['pulse-bubble'] + ' ' + styles['pulse-bubble-3']}
        />
      </div>
      {props.text ? (
        <div className={styles['loader-text']}>{props.text}</div>
      ) : null}
    </div>
  )
}

export default Loader
